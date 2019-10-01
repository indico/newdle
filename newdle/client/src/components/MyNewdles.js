import React, {useEffect, useState} from 'react';
import {Container, Icon, Label, Placeholder} from 'semantic-ui-react';
import {useHistory} from 'react-router';
import {serializeDate, toMoment} from '../util/date';
import styles from './MyNewdles.module.scss';
import client from '../client';

export default function MyNewdles() {
  const [newdles, setNewdles] = useState(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      let newdles;
      try {
        newdles = await client.getMyNewdles();
      } catch (exc) {
        return;
      }
      if (!aborted) {
        setNewdles(newdles);
      }
    })();

    return () => {
      aborted = true;
    };
  }, []);

  return (
    <Container text className={styles.newdles}>
      {newdles === null ? (
        <>
          <Placeholder className={styles.newdle} />
          <Placeholder className={styles.newdle} />
          <Placeholder className={styles.newdle} />
        </>
      ) : (
        newdles.map(newdle => <MyNewdle key={newdle.id} newdle={newdle} />)
      )}
    </Container>
  );
}

function MyNewdle({newdle: {code, title, participants, duration, final_dt: finalDt, timezone}}) {
  const history = useHistory();
  const startTime = finalDt ? serializeDate(finalDt, 'HH:mm') : undefined;
  const endTime = finalDt
    ? serializeDate(toMoment(finalDt).add(duration, 'm'), 'HH:mm')
    : undefined;
  const url = `/newdle/${code}/summary`;
  const answers = participants.filter(x => Object.keys(x.answers).length !== 0);

  return (
    <div className={styles.newdle} onClick={() => history.push(url)}>
      <h3 className={styles.title}>
        <a href={url} onClick={evt => evt.preventDefault()}>
          {title}
        </a>
        <Label color={finalDt ? 'blue' : 'green'} size="tiny" className={styles.state}>
          {finalDt ? 'finished' : 'ongoing'}
        </Label>
      </h3>
      {finalDt && (
        <div className={styles.info}>
          <span>
            <Icon name="calendar alternate outline" />
            <label>{serializeDate(finalDt, 'dddd, D MMMM')}</label>
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
