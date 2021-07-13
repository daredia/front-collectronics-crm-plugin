const jsdom = require("jsdom");
const rp = require('request-promise');
const fixieRequest = rp.defaults({'proxy': process.env.FIXIE_URL});

const username = process.env.COLLECTRONICS_USERNAME;
const pw = process.env.COLLECTRONICS_PW;

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

const fetchAndValidate = async (targetUrl) => {
  return fixieRequest.get(targetUrl, {json: true, timeout: 8000}).auth(username, pw)
    .then(res => {
      return res;
    })
    .catch(err => {
      if (err.code === 'ETIMEDOUT') {
        console.error(`Request to ${targetUrl} timed out after 8000 milliseconds.`);
        throw Error('Request timed out, please try again.');
      }

      console.log(`Request to ${targetUrl} failed, but did not timeout.`)
      console.log(err);
      throw Error(err);
    });
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
  const apiEndpoint = process.env.COLLECTRONICS_API_URL;

  if (refs && refs.length) {
    const responseDatas = [];
    // Note: intentionally firing off requests in sequence (rather than in parallel with Promise.all)
    // because Collectronics api returns internal server error if sent concurrent requests
    for (const ref of refs) {
      const queryString = `Ref=${ref}`;
      const response = await fetchAndValidate(`${apiEndpoint}?${queryString}`);
      console.log({ref, responseData: response.data});
      responseDatas.push(response.data);
    };

    const accountDatas = responseDatas.map(data => formatAccountData(data));
    return accountDatas.filter(data => !!data.account);
  }

  if (email) {
    const queryString = `Email=${email}`;
    const response = await fetchAndValidate(`${apiEndpoint}?${queryString}`);
    const accountData = formatAccountData(response.data);
    console.log({accountDatas: [accountData]});
    return [accountData];
  }

  console.log({accountDatas: []});
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
