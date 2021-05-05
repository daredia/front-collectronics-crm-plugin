import React from 'react';

const ContactInfo = ({contact}) => {
  const {name, phone, email} = contact;
  const entries = [
  	['Name', name],
  	['Phone', phone],
  	['Email', email],
  ];

  return (
  	<div className="info-contact">
  	  <div className="data-title">Account</div>
  	  <ul className="list-data">
  	  	{entries.map((entry, i) => (
  	  	  <li key={i}>
  	  	    <div className="info-entry">
  	  	      <div className="info-label">{entry[0]}</div>
  	  	      <div className="info-value">{entry[1]}</div>
  	  	    </div>
  	  	  </li>
  	  	))}
  	  </ul>
  	</div>
  );
};

export default ContactInfo;
