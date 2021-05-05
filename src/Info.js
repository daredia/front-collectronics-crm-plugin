import React, { useState, useEffect } from 'react';

import { FrontLink } from './FrontActions';
import { useStoreState } from './Store';

const Info = () => {
  const { secret } = useStoreState();

  const [isLoading, setLoadingState] = useState(true);
  const [account, setAccount] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = 'XYZ-101';
    const uri = `/api/search?auth_secret=${secret}&ref=${ref}`;

    setLoadingState(true);
    setError(null);

    fetch(`${uri}`, {
      method: 'GET',
      mode: 'cors'
    })
    .then(r => {
      if (!r.ok && r.status !== 404)
        throw Error(r.statusText);

      if(r.status === 404)
        return ({});

      return r.json();
    })
    .then(response => {
      const {account, msg} = response.data;
      if (account) {
        setAccount(account);
      } else {
        setAccount({});
        setError(msg);
      }
    })
    .catch((err) => {
      setAccount({});
      setError(err.message);
    })
    .finally(() => setLoadingState(false));
  }, [secret]);

  if (isLoading)
    return <div className="notice">Loading...</div>;

  if (error)
    return <div className="notice error">{error}</div>;

  return (
    <div>
      <div className="info-card">
        <div className="info-card-contact">{account.name}</div>
        <div className="info-card-link"><FrontLink href={account.url} label='View in Collectronics' /></div>
      </div>
      <div className="info-card">
        <div className="data-title">Association</div>
        <div>{account.associationName}</div>
      </div>
      <div className="info-card">
        <div className="data-title">Management Company</div>
        <div>{account.companyName}</div>
      </div>
      <div className="info-card">
        <div className="data-title">Workflow Stage</div>
        <div>{account.workflowStage}</div>
      </div>
      {account.contactInfos.map((contact, idx) => (
        <div className="info-contact" key={idx}>
          <div className="data-title">Account</div>
          <ul className="list-data">
            <li>
              <div className="info-entry">
                <div className="info-label">Name</div>
                <div className="info-value">{contact.name}</div>
              </div>
            </li>
            <li>
              <div className="info-entry">
                <div className="info-label">Phone</div>
                <div className="info-value">{contact.phone}</div>
              </div>
            </li>
            <li>
              <div className="info-entry">
                <div className="info-label">Email</div>
                <div className="info-value">{contact.email}</div>
              </div>
            </li>
          </ul>
        </div>)
      )}
    </div>
  );
};

export default Info;
