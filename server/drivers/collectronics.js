const base64 = require('base-64');
const jsdom = require("jsdom");
const fetch = require('node-fetch');

const accountDataResponseTypes = {
  none: {
    msg: 'No account found',
    account: null,
  },
  multiple: {
    msg: 'Multiple accounts found',
    account: null,
  },
  noneOrMultiple: {
    msg: 'No or multiple accounts',
    account: null,
  }
};

const fetchAndValidate = async (url, encodedCredential) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${encodedCredential}`,
    },
  });

  if (!response.ok && response.status !== 404)
      throw Error(response.statusText);

  if (response.status === 404)
    return ({});

  const json = await response.json();
  return json;
};

const formatAccountData = (responseData) => {
  // This case does not seem to happen in practice
  if (!responseData.length) {
    return accountDataResponseTypes.none;
  }

  // This case does not seem to happen in practice
  if (responseData.length > 1) {
    return accountDataResponseTypes.multiple;
  }

  const account = responseData[0];
  if (!account.allianceFileNoHyperLink) {
    return accountDataResponseTypes.noneOrMultiple;
  }

  const dom = new jsdom.JSDOM(account.allianceFileNoHyperLink);
  const accountLinkNode = dom.window.document.querySelector('a');
  const name = accountLinkNode.textContent;
  const url = accountLinkNode.href;

  const contactInfos = account.ownerEmailList.map((email, i) => ({
    email,
    name: account.ownerNameList[i],
    phone: account.ownerPhoneList[i],
  }));

  return {
    account: {
      name,
      url,
      contactInfos,
      associationName: account.associationName,
      companyName: account.companyName,
      workflowStage: account.currentWorkFlowStage,
    }
  };
};

const fetchAccountDatas = async (refs, email) => {
  const username = process.env.COLLECTRONICS_USERNAME;
  const pw = process.env.COLLECTRONICS_PW;
  const encodedCredential = base64.encode(`${username}:${pw}`);

  const apiEndpoint = process.env.COLLECTRONICS_API_URL;

  if (refs && ReadableStreamDefaultController.length) {
    const responseDatas = [];
    // Note: intentionally firing off requests in sequence (rather than in parallel with Promise.all)
    // because Collectronics api returns internal server error if sent concurrent requests
    for (const ref of refs) {
      const queryString = `Ref=${ref}`;
      const response = await fetchAndValidate(`${apiEndpoint}?${queryString}`, encodedCredential);
      responseDatas.push(response.data);
    };

    const accountDatas = responseDatas.map(data => formatAccountData(data));
    return accountDatas.filter(data => !!data.account);
  }

  if (email) {
    const queryString = `Email=${email}`;
    const response = await fetchAndValidate(`${apiEndpoint}?${queryString}`, encodedCredential);
    const accountData = formatAccountData(response.data);
    return [accountData];
  }

  return [];
};

const getAccountData = async (subjectRefs, bodyRefs, email) => {
  console.log({msg: 'Fetching accounts', subjectRefs, bodyRefs});

  // If exactly 1 account is found from subjectRefs, return it
  const subjectRefSingleAccountDatas = await fetchAccountDatas(subjectRefs, null);
  if (subjectRefSingleAccountDatas.length == 1) {
    return subjectRefSingleAccountDatas[0];
  }

  // If multiple accounts found, return appropriate message
  if (subjectRefSingleAccountDatas.length > 1) {
    return accountDataResponseTypes.multiple;
  }

  // No accounts found from subjectRefs. If exactly 1 account is found from bodyRefs, return it
  const bodyRefSingleAccountDatas = await fetchAccountDatas(bodyRefs, null);
  if (bodyRefSingleAccountDatas.length == 1) {
    return bodyRefSingleAccountDatas[0];
  }

  // If multiple accounts found, return appropriate message
  if (bodyRefSingleAccountDatas.length > 1) {
    return accountDataResponseTypes.multiple;
  }

  // No accounts found from refs. Fall back to lookup by email
  const emailAccountDatas = await fetchAccountDatas(null, email);
  if (emailAccountDatas.length == 1) {
    return emailAccountDatas[0];
  }

  return accountDataResponseTypes.noneOrMultiple;
};

module.exports = {
  getAccountData: getAccountData
};
