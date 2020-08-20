import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, Container, Icon, Label, Placeholder} from 'semantic-ui-react';
import {useHistory} from 'react-router';
import {clearParticipantCodes} from '../actions';
import {serializeDate, toMoment} from '../util/date';
import client from '../client';
import {usePageTitle} from '../util/hooks';
import styles from './MyNewdles.module.scss';

export default function MyNewdles() {
  const [newdles, loading] = client.useBackend(() => client.getMyNewdles(), []);
  const history = useHistory();
  const dispatch = useDispatch();
  usePageTitle('My newdles');

  useEffect(() => {
    // this avoids getting an unexpected previous participant in this particular edge case:
    // - the user opens a newdle they created with a specific participant link
    // - they go to "my newdles", and then open that same newdle from there
    // - they switch to the answer view using the buttons on top
    // this would now use the stored participant code, even though after coming from there
    // you would expect to get the participant code linked to your user (if you are a participant),
    // or the usual "enter name" form...
    dispatch(clearParticipantCodes());
  }, [dispatch]);

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
              {startTime} - {endTime} ({timezone})
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

MyNewdle.propTypes = {
  newdle: PropTypes.shape({
    code: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
        auth_uid: PropTypes.string,
        email: PropTypes.string,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
    duration: PropTypes.number.isRequired,
    final_dt: PropTypes.string,
    timezone: PropTypes.string.isRequired,
  }).isRequired,
};
