import React, {useState, useEffect} from 'react';
import {Button, Container, Grid, Header, Icon, Input} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getStep,
  getTitle,
  getDuration,
  areParticipantsDefined,
  getMeetingParticipants,
  shouldConfirmAbortCreation,
  getFullTimeslots,
} from '../selectors';
import {abortCreation, setStep, setTitle} from '../actions';
import Calendar from './Calendar';
import Availability from './Availability';
import UserSearch from './UserSearch';
import UnloadPrompt from './UnloadPrompt';
import styles from './CreateNewdle.module.scss';
import client from '../client';

export default function CreateNewdle() {
  const step = useSelector(getStep);
  const shouldConfirm = useSelector(shouldConfirmAbortCreation);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(abortCreation());
    };
  }, [dispatch]);

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
            <Button color="violet" icon labelPosition="right" onClick={() => dispatch(setStep(3))}>
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
  const [success, setSuccess] = useState(false);
  const [newdle, setNewdle] = useState(null);
  const title = useSelector(getTitle);
  const duration = useSelector(getDuration);
  const timeslots = useSelector(getFullTimeslots);
  const timezone = 'UTC';
  const dispatch = useDispatch();

  async function createNewdle() {
    const params = {
      method: 'POST',
      body: JSON.stringify({title, duration, timezone, time_slots: timeslots}),
    };
    const results = await client.createNewdle(params);
    setNewdle(results);
    setSuccess(true);
  }

  return (
    <Container text>
      {!success && !newdle ? (
        <>
          <Input
            autoFocus
            transparent
            className={styles['title-input']}
            placeholder="Please enter a title for your event..."
            onChange={(_, data) => dispatch(setTitle(data.value))}
          />
          <div className={styles['attention-message']}>
            <Header as="h3" className={styles['header']}>
              Attention
            </Header>
            <p>
              Your participants will receive an e-mail asking them to register to their preference.
              Once the Newdle is created, you will be shown a link you can share with anyone else
              you wish to invite.
            </p>
          </div>
          <div className={styles['create-button']}>
            <Button
              color="violet"
              type="submit"
              disabled={title.length < 3}
              onClick={async () => await createNewdle()}
            >
              Create your Newdle! <span role="img">🍜</span>
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
        </>
      ) : (
        <>
          <Header as="h1" className={styles['newdle-title']}>
            {newdle.title}
          </Header>
          <div className={styles['success-message']}>
            <Header as="h3" className={styles['header']}>
              Done!
            </Header>
            <p>
              Your Newdle was created and invite e-mails have been sent. You can send the following
              link to everyone you'd like to invite:
            </p>
            <div className={styles['newdle-link']}>{newdle.url}</div>
          </div>
          <div className={styles['summary-button']}>
            <Button color="teal">Go to Newdle summary!</Button>
          </div>
        </>
      )}
    </Container>
  );
}
