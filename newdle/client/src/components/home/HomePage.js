import React from 'react';
import {useHistory} from 'react-router';
import {Button} from 'semantic-ui-react';
import LoginRequired from '../login/LoginRequired';
import {Icon} from 'semantic-ui-react';

import participantsIcon from '../../images/participants.svg';
import calendarIcon from '../../images/calendar.svg';
import answersIcon from '../../images/answers.svg';
import {ReactComponent as GitHubIcon} from '../../images/github.svg';

import styles from './HomePage.module.scss';

export default function HomePage() {
  const history = useHistory();

  return (
    <div>
      <div className={styles.container}>
        <h2>How does it work?</h2>
        <ol className={styles.box}>
          <li>
            <img src={participantsIcon} alt="" className={styles.icon} />
            Choose your participants
          </li>
          <li>
            <img src={calendarIcon} alt="" className={styles.icon} />
            Set the time slots based on their availability
          </li>
          <li>
            <img src={answersIcon} alt="" className={styles.icon} />
            <strong>newdle</strong> will collect the answers!
          </li>
        </ol>
        <div className={styles.button}>
          <LoginRequired
            component={Button}
            color="violet"
            icon
            labelPosition="right"
            size="big"
            onClick={() => {
              history.push('/new');
            }}
          >
            Get started
            <Icon name="angle right" />
          </LoginRequired>
        </div>
        <div className={styles.footer}>
          <p className={styles.opensource}>
            newdle is Open Source Software
            <a href="https://github.com/indico/newdle" target="_blank" rel="noopener noreferrer">
              <GitHubIcon />
            </a>
          </p>
          <p className={styles.cern}>
            Made at{' '}
            <a href="https://home.cern" target="_blank" rel="noopener noreferrer">
              CERN
            </a>
            , the place where the web was born.
          </p>
        </div>
      </div>
    </div>
  );
}
