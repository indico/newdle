import React from 'react';
import {useHistory} from 'react-router';
import {Trans} from '@lingui/macro';
import {Icon} from 'semantic-ui-react';
import {Button} from 'semantic-ui-react';
import answersIcon from '../../images/answers.svg';
import calendarIcon from '../../images/calendar.svg';
import participantsIcon from '../../images/participants.svg';
import LoginRequired from '../login/LoginRequired';
import styles from './HomePage.module.scss';

export default function HomePage() {
  const history = useHistory();

  return (
    <div>
      <div className={styles.container}>
        <h2>
          <Trans>How does it work?</Trans>
        </h2>
        <ol className={styles.box}>
          <li>
            <img src={participantsIcon} alt="" className={styles.icon} />
            <span>
              <Trans>Choose your participants</Trans>
            </span>
          </li>
          <li>
            <img src={calendarIcon} alt="" className={styles.icon} />
            <span>
              <Trans>Set the time slots based on their availability</Trans>
            </span>
          </li>
          <li>
            <img src={answersIcon} alt="" className={styles.icon} />
            <span>
              <Trans>
                <strong>newdle</strong> will collect the answers!
              </Trans>
            </span>
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
            <Trans>Get started</Trans>
            <Icon name="angle right" />
          </LoginRequired>
        </div>
      </div>
    </div>
  );
}
