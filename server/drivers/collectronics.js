const base64 = require('base-64');
const jsdom = require("jsdom");
const fetch = require('node-fetch');

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
    return {
      msg: 'No account found',
      account: null,
    };
  }

  // This case does not seem to happen in practice
  if (responseData.length > 1) {
    return {
      msg: 'Multiple accounts found',
      account: null,
    };
  }

  const account = responseData[0];
  if (!account.allianceFileNoHyperLink) {
    return {
      msg: 'No or multiple accounts',
      account: null,
    };
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

const getAccountData = async (ref) => {
  console.log({msg: 'Fetching accounts'});

  const username = process.env.COLLECTRONICS_USERNAME;
  const pw = process.env.COLLECTRONICS_PW;
  const encodedCredential = base64.encode(`${username}:${pw}`);

  const apiHost = 'http://acasstaging7.collectronics.net';
  const endpoint = `/sampleFrontLookupMethod.action?Ref=${ref}`;
  const response = await fetchAndValidate(`${apiHost}${endpoint}`, encodedCredential);
  const {data} = response;

  return formatAccountData(data);
};

module.exports = {
  getAccountData: getAccountData
};
