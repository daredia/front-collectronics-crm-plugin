import React from 'react';

import { FrontCompose } from './FrontActions';

const ContactInfo = ({contact}) => {
  const {name, phone, email} = contact;
  const entries = [
  	['Name', name],
  	['Phone', phone],
    ['Email', <FrontCompose to={email} label={email} />],
  ];

  return (
  	<div className="info-contact">
  	  <div className="data-title">Account</div>
  	  <ul className="list-data">
        {entries.map((entry, i) => entry[1] ? (
  	  	  <li key={i}>
  	  	    <div className="info-entry">
  	  	      <div className="info-label">{entry[0]}</div>
  	  	      <div className="info-value">{entry[1]}</div>
  	  	    </div>
  	  	  </li>
        ) : null)}
  	  </ul>
  	</div>
  );
};

export default ContactInfo;
