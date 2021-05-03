const base64 = require('base-64');
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

const getAccounts = async (ref) => {
  console.log({msg: 'Fetching accounts'});

  const username = process.env.COLLECTRONICS_USERNAME;
  const pw = process.env.COLLECTRONICS_PW;
  const encodedCredential = base64.encode(`${username}:${pw}`);

  const apiHost = 'http://acasstaging7.collectronics.net';
  const endpoint = `/sampleFrontLookupMethod.action?Ref=${ref}`;
  const response = await fetchAndValidate(`${apiHost}${endpoint}`, encodedCredential);
  const {data} = response;

  return data || [];
};

module.exports = {
  getAccounts: getAccounts
};
