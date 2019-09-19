import React, {useEffect, useState} from 'react';
import {Button, Container, Grid, Header, Icon, Input, Message} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {
  getStep,
  getTitle,
  getDuration,
  areParticipantsDefined,
  getMeetingParticipants,
  getParticipantNames,
  shouldConfirmAbortCreation,
  getFullTimeslots,
  isLoggedIn,
  getTimezone,
} from '../selectors';
import {abortCreation, newdleCreated, setStep, setTitle} from '../actions';
import Calendar from './Calendar';
import Availability from './Availability';
import UserSearch from './UserSearch';
import UnloadPrompt from './UnloadPrompt';
import client from '../client';
import {useRouter} from '../util/router';
import styles from './CreateNewdle.module.scss';

export default function CreateNewdle() {
  const isUserLoggedIn = useSelector(isLoggedIn);
  const step = useSelector(getStep);
  const shouldConfirm = useSelector(shouldConfirmAbortCreation);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(abortCreation());
    };
  }, [dispatch]);

  if (!isUserLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <>
      {step === 1 && <ParticipantsPage />}
      {step === 2 && <TimeSlotsPage />}
      {step === 3 && <FinalizePage />}
      <UnloadPrompt router active={shouldConfirm} />
    </>
  );
}

function ParticipantsPage() {
  const dispatch = useDispatch();
  const participantsDefined = useSelector(areParticipantsDefined);
  return (
    <>
      <UserSearch />
      <Container>
        <div className={styles['button-row']}>
          <Button color="violet" icon labelPosition="right" onClick={() => dispatch(setStep(2))}>
            {participantsDefined ? 'Next' : 'Skip'}
            <Icon name="caret right" />
          </Button>
        </div>
      </Container>
    </>
  );
}

function TimeSlotsPage() {
  const dispatch = useDispatch();
  const participants = useSelector(getMeetingParticipants);
  const timeslots = useSelector(getFullTimeslots);
  return (
    <div>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <Calendar />
          </Grid.Column>
          <Grid.Column width={11}>
            <Availability participants={participants} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <div className={styles['button-row']}>
            <Button color="violet" icon labelPosition="left" onClick={() => dispatch(setStep(1))}>
              Back
              <Icon name="caret left" />
            </Button>
            <Button
              color="violet"
              icon
              labelPosition="right"
              disabled={!timeslots.length}
              onClick={() => dispatch(setStep(3))}
            >
              Next step
              <Icon name="caret right" />
            </Button>
          </div>
        </Grid.Row>
      </Grid>
    </div>
  );
}

function FinalizePage() {
  const title = useSelector(getTitle);
  const duration = useSelector(getDuration);
  const timeslots = useSelector(getFullTimeslots);
  const participants = useSelector(getParticipantNames);
  const timezone = useSelector(getTimezone);
  const dispatch = useDispatch();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function createNewdle() {
    setError('');
    setSubmitting(true);
    let newdle;
    try {
      newdle = await client.createNewdle(title, duration, timezone, timeslots, participants);
    } catch (exc) {
      setSubmitting(false);
      setError(exc.toString());
      return;
    }
    setSubmitting(false);
    dispatch(newdleCreated(newdle));
    router.history.push('/new/success');
  }

  const canSubmit = title.length >= 3 && !submitting;

  return (
    <Container text>
      <Input
        autoFocus
        transparent
        className={styles['title-input']}
        placeholder="Please enter a title for your event..."
        value={title}
        disabled={submitting}
        onChange={(_, data) => dispatch(setTitle(data.value))}
        onKeyDown={e => {
          if (e.key === 'Enter' && canSubmit) {
            createNewdle();
          }
        }}
      />
      <div className={styles['attention-message']}>
        <Header as="h3" className={styles['header']}>
          Attention
        </Header>
        <p>
          Your participants will receive an e-mail asking them to register to their preference. Once
          the Newdle is created, you will be shown a link you can share with anyone else you wish to
          invite.
        </p>
      </div>
      {error && (
        <Message error>
          <p>Something when wrong while creating your newdle:</p>
          <code>{error}</code>
        </Message>
      )}
      <div className={styles['create-button']}>
        <Button
          color="violet"
          type="submit"
          disabled={!canSubmit}
          onClick={createNewdle}
          loading={submitting}
        >
          Create your Newdle!{' '}
          <span role="img" aria-label="Newdle">
            🍜
          </span>
        </Button>
      </div>
      <div className={styles['link-row']}>
        <Button
          className={styles['link']}
          onClick={() => dispatch(setStep(1))}
          disabled={submitting}
        >
          Change participants
        </Button>
        <Button
          className={styles['link']}
          onClick={() => dispatch(setStep(2))}
          disabled={submitting}
        >
          Change time slots
        </Button>
      </div>
    </Container>
  );
}
