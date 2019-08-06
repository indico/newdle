import React from 'react';
import {Button, Container, Grid, Icon} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {getStep, areParticipantsDefined, getMeetingParticipants} from './selectors';
import {setStep} from './actions';
import Calendar from './Calendar';
import TimelineExample from './TimelineExample';
import UserSearch from './components/UserSearch';
import styles from './CreateNewdle.module.scss';

export default function CreateNewdle() {
  const step = useSelector(getStep);
  const dispatch = useDispatch();
  return (
    <>
      {step === 1 && <ParticipantsPage />}
      {step === 2 && <TimeSlotsPage />}
      {step === 3 && (
        <div>
          step3
          <div className={styles['button-row']}>
            <Button color="violet" icon labelPosition="left" onClick={() => dispatch(setStep(2))}>
              Back
              <Icon name="caret left" />
            </Button>
          </div>
        </div>
      )}
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
    <div className={styles['time-slots-grid']}>
      <Grid container>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <Calendar />
          </Grid.Column>
          <Grid.Column width={11}>
            <TimelineExample participants={participants} />
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
