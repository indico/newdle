import React from 'react';
import {Button, Container, Icon, Label, Placeholder} from 'semantic-ui-react';
import {useHistory} from 'react-router';
import {serializeDate, toMoment} from '../util/date';
import client from '../client';
import {usePageTitle} from '../util/hooks';
import styles from './MyNewdles.module.scss';

export default function MyNewdles() {
  const [newdles, loading] = client.useBackend(() => client.getMyNewdles(), []);
  const history = useHistory();
  usePageTitle('My newdles');

  let content;
  if (loading || newdles === null) {
    content = (
      <>
        <Placeholder className={styles.newdle} />
        <Placeholder className={styles.newdle} />
        <Placeholder className={styles.newdle} />
      </>
    );
  } else if (newdles.length === 0) {
    content = (
      <div className={styles['no-newdle-container']}>
        <h2>You do not have any newdles yet...</h2>
        <div>
          <Button
            color="violet"
            type="submit"
            onClick={() => {
              history.push('/new');
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
            Create your first newdle! 🍜
          </Button>
        </div>
      </div>
    );
  } else {
    content = newdles.map(newdle => <MyNewdle key={newdle.id} newdle={newdle} />);
  }

  return (
    <Container text className={styles.newdles}>
      {content}
    </Container>
  );
}

function MyNewdle({newdle: {code, title, participants, duration, final_dt: finalDT, timezone}}) {
  const history = useHistory();
  const startTime = finalDT ? serializeDate(finalDT, 'HH:mm') : undefined;
  const endTime = finalDT
    ? serializeDate(toMoment(finalDT).add(duration, 'm'), 'HH:mm')
    : undefined;
  const url = `/newdle/${code}/summary`;
  const answers = participants.filter(x => Object.keys(x.answers).length !== 0);

  return (
    <div className={styles.newdle} onClick={() => history.push(url)}>
      <h3 className={styles.title}>
        <a href={url} onClick={evt => evt.preventDefault()}>
          {title}
        </a>
        <Label color={finalDT ? 'blue' : 'green'} size="tiny" className={styles.state}>
          {finalDT ? 'finished' : 'ongoing'}
        </Label>
      </h3>
      {finalDT && (
        <div className={styles.info}>
          <span>
            <Icon name="calendar alternate outline" />
            <label>{serializeDate(finalDT, 'dddd, D MMMM')}</label>
          </span>
          <span>
            <Icon name="clock outline" />
            <label>
              {`${startTime} - ${endTime}`} ({timezone})
            </label>
          </span>
        </div>
      )}
      <div className={styles.participants}>
        <Icon name="users" />
        <label>
          <em>
            {!participants.length
              ? 'There are no participants yet'
              : answers.length !== participants.length
              ? `${answers.length} out of ${participants.length} participants answered`
              : 'All participants answered'}
          </em>
        </label>
      </div>
    </div>
  );
}
