import React from 'react';

const InfoCard = ({title, cls, children}) => {
  return (
  	<div className="info-card">
  	  <div className={cls}>{title}</div>
  	  {children}
  	</div>
  );
};

export default InfoCard;
