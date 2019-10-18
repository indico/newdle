import _ from 'lodash';
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
  isParticipantAnonymous,
  isAllAvailableSelected,
  isAllAvailableSelectedImplicitly,
  getCalendarDates,
  getParticipantAnswers,
  getHandpickedAnswers,
} from '../../answerSelectors';
import {getUserInfo} from '../../selectors';
import {chooseAllAvailable, fetchBusyTimesForAnswer, fetchParticipant} from '../../actions';
import styles from './answer.module.scss';
import client from '../../client';

function ParticipantName({anonymous, setName, onSubmit, disabled}) {
  const participant = useSelector(getParticipant);
  const user = useSelector(getUserInfo);

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
  } else if (participant) {
    return (
      <>
        {user && participant.auth_uid !== user.uid && (
          <h3 className={styles['on-behalf']}>Answering on behalf of:</h3>
        )}
        <h2 className={styles['participant-title']}>
          <Icon size="big" name="user circle outline" />
          {participant.name}
        </h2>
      </>
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
  const user = useSelector(getUserInfo);
  const participantAnswers = useSelector(getParticipantAnswers);
  const participantHasAnswers = !!Object.keys(participantAnswers).length;
  const participant = useSelector(getParticipant);
  const participantAnonymous = useSelector(isParticipantAnonymous);
  const handpickedAnswers = useSelector(getHandpickedAnswers);

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
            // replace history entry if we are logged in (as going back would instantly redirect
            // you back to your participant); otherwise push it
            history[user ? 'replace' : 'push'](`/newdle/${newdle.code}/${result.code}`);
          }
          return result;
        },
        // this is part 2: taking the newly created participant code and
        // updating the participant's answers based on it
        ({code}) => client.updateParticipantAnswers(newdle.code, code, availabilityData)
      );

  const canSubmit = (participantCode || user || name.length >= 2) && !submitting;
  const saved = submitResult !== null;

  const answerNewdle = () => {
    submitAnswer(newdle.code, participantCode || name, availabilityData);
  };

  useEffect(() => {
    if (newdle && (participantCode || user)) {
      dispatch(fetchParticipant(newdle.code, participantCode || null));
    }
  }, [newdle, user, participantCode, dispatch]);

  useEffect(() => {
    if (user && !participantCode && participant) {
      history.replace(`/newdle/${newdle.code}/${participant.code}`);
    }
  }, [newdle, user, participant, history, participantCode]);

  useEffect(() => {
    if ((participantCode && !participantAnonymous) || (!participantCode && user)) {
      dispatch(fetchBusyTimesForAnswer(newdleCode, participantCode || null, dates));
    }
  }, [dates, newdleCode, participantCode, participantAnonymous, user, dispatch]);

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
            color={participantHasAnswers ? 'teal' : 'violet'}
            content={participantHasAnswers ? 'Update your answer' : 'Send your answer'}
            disabled={
              saved ||
              submitting ||
              !canSubmit ||
              (participantHasAnswers && _.isEqual(participantAnswers, handpickedAnswers))
            }
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
