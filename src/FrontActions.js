import React from 'react';
import { useStoreState } from './Store';

export const FrontLink = ({ label, href }) => {
  const { frontContext } = useStoreState();
  const { openUrl } = frontContext;

  return (
    <a onClick={(e) => {e.preventDefault(); openUrl(href);}} href={href}>
      {label}
    </a>
  );
};
