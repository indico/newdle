import React from 'react';
import styles from './HomeHeader.module.scss';

const HomeHeader = () => (
  <div className={styles.box}>
    <h3>Welcome to newdle!</h3>
    <p>
      <strong>newdle</strong> is a collective meeting scheduling application.
      <br />
      You can use it to find out the best dates/times for your meetings.
    </p>
  </div>
);

export default HomeHeader;
