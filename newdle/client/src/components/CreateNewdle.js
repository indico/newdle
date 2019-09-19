import React, {useEffect} from 'react';
import {Button, Container, Grid, Header, Icon, Input} from 'semantic-ui-react';
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
  const timezone = 'Europe/Zurich';
  const dispatch = useDispatch();
  const router = useRouter();

  async function createNewdle() {
    const newdle = await client.createNewdle(title, duration, timezone, timeslots, participants);
    dispatch(newdleCreated(newdle));
    router.history.push('/new/success');
  }

  const hasValidTitle = title.length >= 3;

  return (
    <Container text>
      <Input
        autoFocus
        transparent
        className={styles['title-input']}
        placeholder="Please enter a title for your event..."
        value={title}
        onChange={(_, data) => dispatch(setTitle(data.value))}
        onKeyDown={e => {
          if (e.key === 'Enter' && hasValidTitle) {
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
      <div className={styles['create-button']}>
        <Button color="violet" type="submit" disabled={!hasValidTitle} onClick={createNewdle}>
          Create your Newdle!{' '}
          <span role="img" aria-label="Newdle">
            🍜
          </span>
        </Button>
      </div>
      <div className={styles['link-row']}>
        <Button className={styles['link']} onClick={() => dispatch(setStep(1))}>
          Change participants
        </Button>
        <Button className={styles['link']} onClick={() => dispatch(setStep(2))}>
          Change time slots
        </Button>
      </div>
    </Container>
  );
}
