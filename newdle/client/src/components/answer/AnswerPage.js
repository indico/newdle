import {Button, Checkbox, Grid, Input, Message, Segment} from 'semantic-ui-react';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import MonthCalendar from './MonthCalendar';
import Calendar from './Calendar';
import {
  getAnswers,
  getNewdle,
  getNumberOfAvailableAnswers,
  getNumberOfTimeslots,
  isAllAvailableSelected,
  isAllAvailableSelectedImplicitly,
} from '../../answerSelectors';
import {chooseAllAvailable} from '../../actions';
import styles from './answer.module.scss';
import client from '../../client';

export default function AnswerPage() {
  const {partcode: participantCode} = useParams();
  const dispatch = useDispatch();
  const newdle = useSelector(getNewdle);
  const numberOfTimeslots = useSelector(getNumberOfTimeslots);
  const numberOfAvailable = useSelector(getNumberOfAvailableAnswers);
  const availabilityData = useSelector(getAnswers);
  const allAvailableSelected = useSelector(isAllAvailableSelected);
  const allAvailableDisabled = useSelector(isAllAvailableSelectedImplicitly);
  const [name, setName] = useState('');

  const [submitAnswer, submitting, error] = participantCode
    ? client.useBackend(client.updateParticipantAnswers)
    : client.useBackend(
        async (...params) => {
          const result = await client.createAnonymousParticipant(...params);
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

  async function answerNewdle() {
    await submitAnswer(newdle.code, participantCode || name, availabilityData);
  }

  if (!newdle) {
    return null;
  }

  return (
    <div>
      <Grid container>
        {error && (
          <Message error>
            <p>Something went wrong while sending your answer:</p>
            <code>{error}</code>
          </Message>
        )}
        {!participantCode && (
          <Grid.Row>
            <div className={styles['participant-name-box']}>
              <h3>Who are you?</h3>
              <Input
                autoFocus
                transparent
                className={styles['participant-name-input']}
                placeholder="Please enter your name..."
                disabled={submitting}
                onChange={(_, data) => setName(data.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && canSubmit) {
                    answerNewdle();
                  }
                }}
              />
            </div>
          </Grid.Row>
        )}
        <Grid.Row columns={2}>
          <Grid.Column width={5}>
            <MonthCalendar />
            <Segment attached="bottom" secondary>
              <Checkbox
                toggle
                label="Accept all options where I'm available"
                disabled={allAvailableDisabled}
                checked={allAvailableSelected}
                onChange={(_, {checked}) => dispatch(chooseAllAvailable(checked))}
              />
            </Segment>
          </Grid.Column>
          <Grid.Column width={11}>
            <Calendar getAvailability={!!participantCode} />
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
            disabled={submitting || !canSubmit}
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
