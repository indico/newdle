import React from 'react';
import {Trans} from '@lingui/macro';
import styles from './HomeHeader.module.scss';

const HomeHeader = () => (
  <div className={styles.box}>
    <h3>
      <Trans>Welcome to newdle!</Trans>
    </h3>
    <p>
      <Trans>
        <strong>newdle</strong> is a collective meeting scheduling application.
      </Trans>
      <br />
      <Trans>You can use it to find out the best dates/times for your meetings.</Trans>
    </p>
  </div>
);

export default HomeHeader;
