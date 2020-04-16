import React from 'react';
import flask from 'flask-urls.macro';
import {Container, Icon, Label, Placeholder} from 'semantic-ui-react';
import {useHistory} from 'react-router';
import {serializeDate, toMoment} from '../util/date';
import client from '../client';
import {usePageTitle} from '../util/hooks';
import styles from './MyNewdles.module.scss';

export default function NewdlesParticipating() {
  const [participations, loading] = client.useBackend(() => client.getNewdlesParticipating(), []);
  usePageTitle("Newdles I'm participating in");

  let content;
  if (loading || participations === null) {
    content = (
      <>
        <Placeholder className={styles.newdle} />
        <Placeholder className={styles.newdle} />
        <Placeholder className={styles.newdle} />
      </>
    );
  } else if (participations.length === 0) {
    content = (
      <div className={styles['no-newdle-container']}>
        <h2>You are not part of any newdles yet.</h2>
      </div>
    );
  } else {
    participations
      // Sort the newdles by their final date ascending
      .sort((a, b) => new Date(a.newdle.final_dt) - new Date(b.newdle.final_dt))
      // Show the newdles that require your immediate attention, without any final answers, first
      .sort((a, b) => !!a.newdle.final_dt - !!b.newdle.final_dt)
      .sort((a, b) => Object.keys(a.answers).length - Object.keys(b.answers).length)
      // Move the newdles with a final date in the past (expired) to the bottom of the list
      .sort(
        (a, b) =>
          (a.newdle.final_dt && new Date(a.newdle.final_dt) < new Date()) -
          (b.newdle.final_dt && new Date(b.newdle.final_dt) < new Date())
      );
    content = participations.map(participation => (
      <NewdleParticipation
        key={participation.newdle.id}
        newdle={participation.newdle}
        answers={participation.answers}
        participant_code={participation.code}
      />
    ));
  }

  return (
    <Container text className={styles.newdles}>
      {content}
    </Container>
  );
}

function NewdleParticipation({
  newdle: {code, title, duration, final_dt: finalDT, timezone, timeslots},
  answers,
  participant_code,
}) {
  const history = useHistory();
  const startTime = finalDT && serializeDate(finalDT, 'HH:mm');
  const endTime = finalDT && serializeDate(toMoment(finalDT).add(duration, 'm'), 'HH:mm');
  const url = flask`newdle`({code, participant_code});
  const slotsChosen = timeslots.filter(timeslot =>
    ['available', 'ifneedbe', 'unavailable'].includes(answers[timeslot])
  );

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
              {startTime} - {endTime} ({timezone})
            </label>
          </span>
        </div>
      )}
      <div className={styles.participants}>
        <Icon name="clock outline" />
        <label>
          <em>
            {finalDT
              ? 'This newdle has finished'
              : !slotsChosen.length
              ? 'Awaiting your reply'
              : `You replied with ${slotsChosen.length} timeslot(s)`}
          </em>
        </label>
      </div>
    </div>
  );
}
