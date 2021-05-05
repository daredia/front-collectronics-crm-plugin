import React, { useState, useEffect } from 'react';

import ContactInfo from './ContactInfo';
import { FrontLink } from './FrontActions';
import InfoCard from './InfoCard';
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
      <InfoCard title={account.name} cls="info-card-title">
        <div className="info-card-link"><FrontLink href={account.url} label='View in Collectronics' /></div>
      </InfoCard>

      <InfoCard title="Association" cls="data-title">
        <div>{account.associationName}</div>
      </InfoCard>

      <InfoCard title="Management Company" cls="data-title">
        <div>{account.companyName}</div>
      </InfoCard>

      <InfoCard title="Workflow Stage" cls="data-title">
        <div className="info-card-pill">{account.workflowStage}</div>
      </InfoCard>

      {account.contactInfos.map((contact, idx) =>
        <ContactInfo contact={contact} key={idx} />
      )}
    </div>
  );
};

export default Info;
