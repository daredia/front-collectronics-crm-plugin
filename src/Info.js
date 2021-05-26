import React, { useState, useEffect } from 'react';

import ContactInfo from './ContactInfo';
import { FrontLink } from './FrontActions';
import InfoCard from './InfoCard';
import { useStoreState } from './Store';

const Info = () => {
  const { frontContext, secret } = useStoreState();

  const [isLoading, setLoadingState] = useState(true);
  const [account, setAccount] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!frontContext?.conversation) {
      setError('This plugin only works with conversations.');
      return undefined;
    }

    async function listAllMessagesAndGetBody() {
      const response = await frontContext.listMessages();

      let nextPageToken = response.token;
      const messages = response.results;

      while (nextPageToken) {
        const {results, token} = await frontContext.listMessages(nextPageToken);

        nextPageToken = token;
        messages.push(...results);
      }

      const body = messages.map(m => {
        if (m.content?.type === 'text') {
          return m.content.body;
        }

        if (m.content?.type === 'html') {
          console.log({contentBody: m.content.body});
          const el = document.createElement('div');
          el.innerHTML = m.content.body;
          return el.innerText;
        }

        return '';
      }).join('\n');
      return body || '';
    }

    async function fetchAccount() {
      const {subject} = frontContext.conversation || '';
      const email = frontContext.conversation.recipient?.handle || '';
      const body = await listAllMessagesAndGetBody();
      console.log({subject, email, body});
      const regex = /([A-Z]+[-][0-9]{2,3}(?:-[A-Z]{2})?)/g;
      // TODO: make subjectRefs and bodyRefs unique with lodash
      const subjectRefs = subject.match(regex) || [];
      const bodyRefs = body.match(regex) || [];

      let uri = `/api/search?auth_secret=${secret}&email=${email}`;
      if (subjectRefs.length) {
        uri += `&subjectRefs=${subjectRefs}`;
      }
      if (bodyRefs.length) {
        uri += `&bodyRefs=${bodyRefs}`;
      }

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
        setAccount(account);
        setMsg(msg);
      })
      .catch((err) => {
        setAccount({});
        setError(err.message);
      })
      .finally(() => setLoadingState(false));
    }

    fetchAccount();
  }, [secret, frontContext]);

  if (isLoading)
    return <div className="notice">Loading...</div>;

  if (error)
    return <div className="notice error">{error}</div>;

  if (!account) {
    const url = 'https://acaslive.collectronics.net/appRWHomePage.jsp';
    return (
      <div>
        <InfoCard title={msg} cls="info-card-title">
          <div className="info-card-link"><FrontLink href={url} label='Open in Collectronics' /></div>
        </InfoCard>
      </div>
    );
  }

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
