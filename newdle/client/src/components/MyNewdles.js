import React from 'react';
import {Container, Icon, Label} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../util/date';
import {useRouter} from '../util/router';
import styles from './MyNewdles.module.scss';

function MyNewdle({
  newdle: {id, code, title, participantsCount, participantsTotal, duration, finalDt, timezone},
}) {
  const router = useRouter();
  const startTime = finalDt ? serializeDate(finalDt, 'HH:mm') : undefined;
  const endTime = finalDt
    ? serializeDate(toMoment(finalDt).add(duration, 'm'), 'HH:mm')
    : undefined;
  return (
    <div className={styles.newdle} onClick={() => router.history.push(`/newdle/${code}/summary`)}>
      <h3 className={styles.title}>
        {title}
        <Label color={finalDt ? 'blue' : 'green'} size="tiny" className={styles.state}>
          {finalDt ? 'finished' : 'ongoing'}
        </Label>
      </h3>
      {finalDt && (
        <div className={styles.info}>
          <span>
            <Icon name="calendar alternate outline" />
            <label>{serializeDate(finalDt, 'Do MMMM')}</label>
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
            {participantsCount !== participantsTotal
              ? `${participantsCount} out of ${participantsCount} participants answered`
              : 'All the participants answered'}
          </em>
        </label>
      </div>
    </div>
  );
}

export default function MyNewdles() {
  const dummyData = [
    {
      id: 1,
      code: 'abc',
      title: 'Indico weekly meeting',
      duration: 60,
      timezone: 'Europe/Zurich',
      finalDt: null,
      participantsCount: 5,
      participantsTotal: 7,
    },
    {
      id: 2,
      code: 'xyz',
      title: '2.2 Release Reflection Workshop',
      duration: 60,
      timezone: 'Europe/Zurich',
      finalDt: '2019-07-01T10:30',
      participantsCount: 7,
      participantsTotal: 7,
    },
  ];
  return (
    <Container text className={styles.newdles}>
      {dummyData.map(newdle => (
        <MyNewdle key={newdle.id} newdle={newdle} />
      ))}
    </Container>
  );
}
