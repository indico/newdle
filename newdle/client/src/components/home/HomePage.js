import React from 'react';
import {useHistory} from 'react-router';
import {Button} from 'semantic-ui-react';
import LoginRequired from '../login/LoginRequired';
import {Icon} from 'semantic-ui-react';

import {ReactComponent as TeamIcon} from '../../images/team.svg';
import {ReactComponent as TimetableIcon} from '../../images/timetable.svg';
import {ReactComponent as DiscussIcon} from '../../images/discuss-issue.svg';
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
            <TeamIcon className={styles.icon} />
            Choose your participants
          </li>
          <li>
            <TimetableIcon className={styles.icon} />
            Set the time slots based on their availability
          </li>
          <li>
            <DiscussIcon className={styles.icon} />
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
          <p className={styles.credits}>
            "Team", "Timetable" and "Discuss Issue" icons made by{' '}
            <a
              href="https://www.flaticon.com/authors/freepik"
              title="Freepik"
              target="_blank"
              rel="noopener noreferrer"
            >
              Freepik
            </a>{' '}
            from{' '}
            <a
              href="https://www.flaticon.com/"
              title="Flaticon"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.flaticon.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
