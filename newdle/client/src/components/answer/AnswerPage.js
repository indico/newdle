import {Button, Checkbox, Container, Grid, Icon, Input, Message, Segment} from 'semantic-ui-react';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import {useHistory} from 'react-router';
import {Trans, Plural, t} from '@lingui/macro';
import MonthCalendar from './MonthCalendar';
import Calendar from './Calendar';
import FinalDate from '../common/FinalDate';
import {
  getAnswers,
  getNewdle,
  getNewdleTimezone,
  getNumberOfAvailableAnswers,
  getNumberOfTimeslots,
  getParticipant,
  getUserTimezone,
  isParticipantUnknown,
  isAllAvailableSelected,
  isAllAvailableSelectedImplicitly,
  getCalendarDates,
  getParticipantAnswers,
  haveParticipantAnswersChanged,
  busyTimesExist,
  busyTimesLoading,
} from '../../answerSelectors';
import {getUserInfo} from '../../selectors';
import {
  chooseAllAvailable,
  fetchBusyTimesForAnswer,
  fetchParticipant,
  setParticipantCode,
  setUserTimezone,
} from '../../actions';
import TimezonePicker from '../common/TimezonePicker';
import client from '../../client';
import {getInitialUserTimezone} from '../../util/date';
import {useIsSmallScreen, usePageTitle} from '../../util/hooks';

import timezoneIcon from '../../images/timezone.svg';
import styles from './answer.module.scss';

function ParticipantName({unknown, setName, onSubmit, disabled}) {
  const participant = useSelector(getParticipant);
  const user = useSelector(getUserInfo);

  if (unknown) {
    return (
      <div className={styles['participant-name-box']}>
        <h3>
          <Trans>Who are you?</Trans>
        </h3>
        <Input
          autoFocus
          transparent
          className={styles['participant-name-input']}
          placeholder={t`Please enter your name...`}
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
          <h3 className={styles['on-behalf']}>
            <Trans>Answering on behalf of:</Trans>
          </h3>
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
  const [_comment, setComment] = useState(null);
  const comment = _comment === null && participant ? participant.comment : _comment || '';
  const participantUnknown = useSelector(isParticipantUnknown);
  const participantAnswersChanged = useSelector(haveParticipantAnswersChanged);
  const hasBusyTimes = useSelector(busyTimesExist);
  const loadingBusyTimes = useSelector(busyTimesLoading);
  const newdleTz = useSelector(getNewdleTimezone);
  const isSmallScreen = useIsSmallScreen();
  const userTz = useSelector(getUserTimezone);
  usePageTitle(newdle && newdle.title, true);

  const [submitAnswer, submitting, , submitResult] = participantCode
    ? client.useBackendLazy(client.updateParticipantAnswers)
    : client.useBackendLazy(
        async (...params) => {
          const unknown = !user;
          const [newdleCode, participantName] = params;
          const result = await client.createParticipant(newdleCode, participantName, unknown);
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
        ({code}) => client.updateParticipantAnswers(newdle.code, code, availabilityData, comment)
      );

  const canSubmit = (participantCode || user || name.length >= 2) && !submitting;
  const saved = submitResult !== null;

  const answerNewdle = () => {
    submitAnswer(newdle.code, participantCode || name, availabilityData, comment);
  };

  useEffect(() => {
    if (newdle && (participantCode || user) && !submitting) {
      dispatch(fetchParticipant(newdle.code, participantCode || null));
      if (participantCode) {
        dispatch(setParticipantCode(newdle.code, participantCode));
      }
    }
  }, [newdle, user, participantCode, dispatch, submitting]);

  useEffect(() => {
    if (newdle && user && !participantCode && participant) {
      history.replace(`/newdle/${newdle.code}/${participant.code}`);
    }
  }, [newdle, user, participant, history, participantCode]);

  useEffect(() => {
    if ((participantCode && !participantUnknown) || (!participantCode && user)) {
      // Fetching busy times for user's timezone so no timezone conversion needed later
      dispatch(fetchBusyTimesForAnswer(newdleCode, participantCode || null, dates, userTz));
    }
  }, [dates, newdleCode, participantCode, participantUnknown, user, userTz, dispatch]);

  if (!newdle || (participantCode && !participant)) {
    return null;
  }

  if (newdle.deleted) {
    return (
      <Container text>
        <Message>
          <Trans>This newdle has been deleted by its creator.</Trans>
        </Message>
      </Container>
    );
  }

  const defaultUserTz = getInitialUserTimezone();
  const submitDisabled =
    submitting ||
    !canSubmit ||
    (participantCode && !participant) ||
    (participantHasAnswers && !participantAnswersChanged && comment === participant.comment);

  if (newdle.final_dt) {
    return (
      <Container text>
        <Message
          info
          icon="info circle"
          header={t`This newdle has already finished`}
          content={t`It is not possible to answer this newdle anymore.`}
        />
        <FinalDate {...newdle} />
      </Container>
    );
  }

  return (
    <div>
      <Grid container stackable>
        {saved && (
          <Grid.Row centered>
            <Message success>
              <p>
                <Trans>Your answer has been saved!</Trans>
              </p>
            </Message>
          </Grid.Row>
        )}
        <Grid.Row>
          <Grid.Column>
            <ParticipantName
              unknown={!participantCode && !user}
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
          <Grid.Column computer={5} tablet={8}>
            <MonthCalendar />
            {hasBusyTimes && (
              <Segment attached="bottom" secondary>
                <Checkbox
                  className={styles['all-options-checkbox']}
                  toggle
                  label={t`Accept all options where I'm available`}
                  disabled={allAvailableDisabled || loadingBusyTimes}
                  checked={allAvailableSelected}
                  onChange={(_, {checked}) => dispatch(chooseAllAvailable(checked))}
                />
              </Segment>
            )}
            <div className={styles['timezone-box']}>
              <img src={timezoneIcon} alt="" className={styles.icon} />
              <div className={styles['timezone-picker']}>
                <TimezonePicker
                  onChange={value => {
                    dispatch(setUserTimezone(value));
                  }}
                  currentTz={userTz}
                  inline
                />
              </div>
            </div>
            {newdleTz !== userTz && (
              <div className={styles['newdle-timezone']}>
                <Trans>
                  originally created in the{' '}
                  <button
                    className={styles['original-timezone']}
                    onClick={() => {
                      dispatch(setUserTimezone(newdleTz, false));
                    }}
                  >
                    {newdleTz}
                  </button>{' '}
                  timezone
                </Trans>
              </div>
            )}
            {newdleTz === userTz && userTz !== defaultUserTz && (
              <div className={styles['newdle-timezone']}>
                <Trans>
                  switch back to the{' '}
                  <button
                    className={styles['original-timezone']}
                    onClick={() => {
                      dispatch(setUserTimezone(defaultUserTz, false));
                    }}
                  >
                    {defaultUserTz}
                  </button>{' '}
                  timezone
                </Trans>
              </div>
            )}
          </Grid.Column>
          <Grid.Column computer={11} tablet={8}>
            <Calendar />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className={styles['bottom-row']}>
          <span className={`${styles['options-msg']} ${numberOfAvailable ? '' : 'none'}`}>
            {numberOfAvailable ? (
              <>
                <Plural
                  value={numberOfTimeslots}
                  one={`${numberOfAvailable} out of # option chosen`}
                  other={`${numberOfAvailable} out of # options chosen`}
                />
              </>
            ) : (
              <em>
                <Trans>No options chosen</Trans>
              </em>
            )}
          </span>
          <Input
            type="text"
            placeholder={t`Leave a comment...`}
            className={styles['comment-submit']}
            value={comment}
            onChange={(__, {value}) => setComment(value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !submitDisabled) {
                answerNewdle();
              }
            }}
            action={!isSmallScreen}
          >
            <input />
            <Button
              size="large"
              color={participantHasAnswers ? 'teal' : 'violet'}
              content={participantHasAnswers ? t`Update your answer` : t`Send your answer`}
              disabled={submitDisabled}
              loading={submitting}
              icon="send"
              onClick={answerNewdle}
            />
          </Input>
        </Grid.Row>
      </Grid>
    </div>
  );
}
