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

  {/*return <pre>{JSON.stringify(accounts, undefined, 2)}</pre>;*/}

  return (
    <div>
      <div className="info-card">
        <div className="info-card-contact">XYZ-101</div>
        <div className="info-card-link"><FrontLink href='http://collectronics.com' label='View in Collectronics' /></div>
      </div>
      <div className="info-card">
        <div className="data-title">Association</div>
        <div>Florida Association</div>
      </div>
      <div className="info-card">
        <div className="data-title">Management Company</div>
        <div>Demo Company</div>
      </div>
      <div className="info-card">
        <div className="data-title">Workflow Stage</div>
        <div>Payment Plan</div>
      </div>
      <div className="info-contact">
        { accounts.length ? (
          <>
            <div className="data-title">Account</div>
            <ul className="list-data">
              {accounts.map((e, idx) => <li key={idx}>
                <div className="info-entry">
                  <div className="info-label">Name</div>
                  <div className="info-value">Christian East</div>
                </div>
              </li>)}
            </ul>
          </>
        ) : undefined }
      </div>
    </div>
  )
};

export default Info;
