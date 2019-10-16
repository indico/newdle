import {Button, Checkbox, Container, Grid, Icon, Input, Message, Segment} from 'semantic-ui-react';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import {useHistory} from 'react-router';
import MonthCalendar from './MonthCalendar';
import Calendar from './Calendar';
import FinalDate from '../common/FinalDate';
import {
  getAnswers,
  getNewdle,
  getNumberOfAvailableAnswers,
  getNumberOfTimeslots,
  getParticipant,
  isAllAvailableSelected,
  isAllAvailableSelectedImplicitly,
  getCalendarDates,
} from '../../answerSelectors';
import {getUserInfo} from '../../selectors';
import {chooseAllAvailable, fetchBusyTimesForAnswer, fetchParticipant} from '../../actions';
import styles from './answer.module.scss';
import client from '../../client';

function ParticipantName({anonymous, setName, onSubmit, disabled}) {
  const participant = useSelector(getParticipant);
  const user = useSelector(getUserInfo);
  let p = null;
  if (participant) {
    p = participant;
  } else if (user) {
    p = user;
  }

  if (anonymous) {
    return (
      <div className={styles['participant-name-box']}>
        <h3>Who are you?</h3>
        <Input
          autoFocus
          transparent
          className={styles['participant-name-input']}
          placeholder="Please enter your name..."
          disabled={disabled}
          onChange={(_, data) => setName(data.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onSubmit();
            }
          }}
        />
      </div>
    );
  } else if (p) {
    return (
      <h2 className={styles['participant-title']}>
        <Icon size="big" name="user circle outline" />
        {p.name}
      </h2>
    );
  } else {
    return null;
  }
}

export default function AnswerPage() {
  const {partcode: participantCode, code: newdleCode} = useParams();
  const dispatch = useDispatch();
  const newdle = useSelector(getNewdle);
  const numberOfTimeslots = useSelector(getNumberOfTimeslots);
  const numberOfAvailable = useSelector(getNumberOfAvailableAnswers);
  const availabilityData = useSelector(getAnswers);
  const allAvailableSelected = useSelector(isAllAvailableSelected);
  const allAvailableDisabled = useSelector(isAllAvailableSelectedImplicitly);
  const dates = useSelector(getCalendarDates);
  const [name, setName] = useState('');
  const history = useHistory();

  const [submitAnswer, submitting, error, submitResult] = participantCode
    ? client.useBackend(client.updateParticipantAnswers)
    : client.useBackend(
        async (...params) => {
          const anonymous = !user;
          const [newdleCode, participantName] = params;
          const result = await client.createParticipant(newdleCode, participantName, anonymous);
          // in between requests (after participant created), let's redirect
          // to the new participant-bound URL
          if (!participantCode) {
            history.push(`/newdle/${newdle.code}/${result.code}`);
          }
          return result;
        },
        // this is part 2: taking the newly created participant code and
        // updating the participant's answers based on it
        ({code}) => client.updateParticipantAnswers(newdle.code, code, availabilityData)
      );

  const canSubmit = (participantCode || name.length >= 2) && !submitting;
  const saved = submitResult !== null;

  const answerNewdle = () => {
    submitAnswer(newdle.code, participantCode || name, availabilityData);
  };

  useEffect(() => {
    if (newdle && participantCode) {
      dispatch(fetchParticipant(newdle.code, participantCode));
    }
  }, [newdle, participantCode, dispatch]);

  useEffect(() => {
    if (participantCode) {
      dispatch(fetchBusyTimesForAnswer(newdleCode, participantCode, dates));
    }
  }, [dates, newdleCode, participantCode, dispatch]);

  if (!newdle) {
    return null;
  }

  if (newdle.final_dt) {
    return (
      <Container text>
        <Message
          info
          icon="info circle"
          header="This newdle has already finished"
          content="It is not possible to answer this newdle anymore."
        />
        <FinalDate {...newdle} />
      </Container>
    );
  }

  return (
    <div>
      <Grid container>
        {error && (
          <Grid.Row centered>
            <Message error>
              <p>Something went wrong while sending your answer:</p>
              <code>{error}</code>
            </Message>
          </Grid.Row>
        )}
        {saved && (
          <Grid.Row centered>
            <Message success>
              <p>Your answer has been saved!</p>
            </Message>
          </Grid.Row>
        )}
        <Grid.Row>
          <Grid.Column>
            <ParticipantName
              anonymous={!participantCode && !user}
              setName={setName}
              disabled={submitting}
              onSubmit={() => {
                if (canSubmit) {
                  answerNewdle();
                }
              }}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <MonthCalendar />
            <Segment attached="bottom" secondary>
              <Checkbox
                className={styles['all-options-checkbox']}
                toggle
                label="Accept all options where I'm available"
                disabled={allAvailableDisabled}
                checked={allAvailableSelected}
                onChange={(_, {checked}) => dispatch(chooseAllAvailable(checked))}
              />
            </Segment>
          </Grid.Column>
          <Grid.Column width={11}>
            <Calendar />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className={styles['bottom-row']}>
          <span className={`${styles['options-msg']} ${numberOfAvailable ? '' : 'none'}`}>
            {numberOfAvailable ? (
              <>
                {numberOfAvailable} out of {numberOfTimeslots} options chosen
              </>
            ) : (
              <em>No options chosen</em>
            )}
          </span>
          <Button
            size="large"
            color="violet"
            content="Send your answer"
            disabled={saved || submitting || !canSubmit}
            loading={submitting}
            icon="send"
            onClick={() => {
              answerNewdle();
            }}
          />
        </Grid.Row>
      </Grid>
    </div>
  );
}
