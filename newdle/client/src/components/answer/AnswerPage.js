import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {useParams} from 'react-router-dom';
import {Trans, Plural, t} from '@lingui/macro';
import PropTypes from 'prop-types';
import {
  Tab,
  Button,
  Checkbox,
  Container,
  Grid,
  Input,
  Image,
  Message,
  Segment,
} from 'semantic-ui-react';
import {
  chooseAllAvailable,
  fetchBusyTimesForAnswer,
  fetchNewdle,
  fetchParticipant,
  setParticipantCode,
  setUserTimezone,
} from '../../actions';
import {
  getAnswers,
  getNewdle,
  getNewdleTimezone,
  getNumberOfAvailableAnswers,
  getNumberOfAnyAvailableAnswers,
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
  getBusyTimes,
  getNewdleDuration,
  getGridViewActive,
} from '../../answerSelectors';
import client from '../../client';
import timezoneIcon from '../../images/timezone.svg';
import {getUserInfo} from '../../selectors';
import {getInitialUserTimezone} from '../../util/date';
import {useIsMobile, useIsSmallScreen, usePageTitle} from '../../util/hooks';
import FinalDate from '../common/FinalDate';
import TimezonePicker from '../common/TimezonePicker';
import UnloadPrompt from '../UnloadPrompt';
import AnswerGrid from './AnswerGrid';
import Calendar from './Calendar';
import MonthCalendar from './MonthCalendar';
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
          <Image src={participant.avatar_url} alt="" avatar />
          <span className={styles['participant-name']}>{participant.name}</span>
        </h2>
      </>
    );
  } else {
    return null;
  }
}

ParticipantName.propTypes = {
  unknown: PropTypes.bool.isRequired,
  setName: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default function AnswerPage() {
  const {partcode: participantCode, code: newdleCode} = useParams();
  const dispatch = useDispatch();
  const newdle = useSelector(getNewdle);
  const numberOfTimeslots = useSelector(getNumberOfTimeslots);
  const numberOfAvailable = useSelector(getNumberOfAvailableAnswers);
  const numberOfAnyAvailable = useSelector(getNumberOfAnyAvailableAnswers);
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
  const gridViewActive = useSelector(getGridViewActive);
  const [_comment, setComment] = useState(null);
  const comment = _comment === null && participant ? participant.comment : _comment || '';
  const participantUnknown = useSelector(isParticipantUnknown);
  const participantAnswersChanged = useSelector(haveParticipantAnswersChanged);
  const hasBusyTimes = useSelector(busyTimesExist);
  const loadingBusyTimes = useSelector(busyTimesLoading);
  const busyTimes = useSelector(getBusyTimes);
  const duration = useSelector(getNewdleDuration);
  const newdleTz = useSelector(getNewdleTimezone);
  const isSmallScreen = useIsSmallScreen();
  const isMobile = useIsMobile();
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
        ({code}) => client.updateParticipantAnswers(newdle.code, code, availabilityData, comment),
        // refetch the new participant list
        () => !newdle.private && dispatch(fetchNewdle(newdle.code, true))
      );

  const canSubmit = (participantCode || user || name.length >= 2) && !submitting;
  const saved = submitResult !== null;

  const answerNewdle = () => {
    submitAnswer(newdle.code, participantCode || name, availabilityData, comment);
    if (comment !== comment.trim()) {
      setComment(comment.trim());
    }
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

  useEffect(() => {
    if (saved) {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }, [saved]);

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

  const promptOnUnload =
    // we sometimes redirect on submit
    !submitting &&
    // no answers => any change from the default triggers the confirmation
    ((!participantHasAnswers && (numberOfAnyAvailable !== 0 || comment !== '' || name !== '')) ||
      // saved answers => any change from the existing data triggers the confirmation
      (participantHasAnswers && (participantAnswersChanged || comment !== participant.comment)));

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

  const unknown = !participantCode && !user;

  const participantName = (
    <ParticipantName
      unknown={unknown}
      setName={setName}
      disabled={submitting}
      onSubmit={() => {
        if (canSubmit) {
          answerNewdle();
        }
      }}
    />
  );

  const calendarColumn = (
    <>
      <MonthCalendar disabled={gridViewActive} />
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
    </>
  );

  const mobileViewPanes = [
    {
      menuItem: t`Calendar`,
      render: function CalendarPane() {
        return (
          <Tab.Pane className={styles['tab-pane']} attached={false}>
            {calendarColumn}
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: t`Timeslots`,
      render: function TimeslotsPane() {
        return (
          <Tab.Pane className={styles['tab-pane']} attached={false}>
            <Calendar />
          </Tab.Pane>
        );
      },
    },
  ];

  return (
    <div>
      {saved && (
        <div className={styles['message-container']}>
          <Message success>
            <p>
              <Trans>Your answer has been saved!</Trans>
            </p>
          </Message>
        </div>
      )}
      {participant && (
        <div className={styles['message-container']}>
          <Message warning>
            <p>
              <Trans>
                This page is personal and its URL should not be shared. Please use the shareable
                link above to share the newdle with others.
              </Trans>
            </p>
          </Message>
        </div>
      )}
      {isMobile && (
        <>
          {participantName}
          <Tab panes={mobileViewPanes} defaultActiveIndex={1} menu={{secondary: true}} />
        </>
      )}
      {!isMobile && (!gridViewActive || unknown) && (
        <Grid container stackable>
          <Grid.Row>
            <Grid.Column>{participantName}</Grid.Column>
          </Grid.Row>
        </Grid>
      )}
      {!isMobile && !gridViewActive && (
        <Grid container stackable>
          <Grid.Row columns={2}>
            <Grid.Column computer={5} tablet={8}>
              {calendarColumn}
            </Grid.Column>
            <Grid.Column computer={11} tablet={8}>
              <Calendar />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )}
      {gridViewActive && (
        <div className={styles['grid-view']}>
          {!unknown && <div className={styles['grid-view-name']}>{participantName}</div>}
          <div className={styles['grid-view-flex']}>
            <div className={styles['grid-view-calendar']}>{calendarColumn}</div>
            <div className={styles['grid-view-table']}>
              <AnswerGrid
                unknown={unknown}
                name={name}
                user={user}
                participant={participant}
                comment={comment}
                hasBusyTimes={hasBusyTimes}
                busyTimes={busyTimes}
                duration={duration}
                isPrivate={newdle.private}
              />
            </div>
          </div>
        </div>
      )}
      <Grid container stackable>
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
            <UnloadPrompt router active={promptOnUnload} />
          </Input>
        </Grid.Row>
      </Grid>
    </div>
  );
}
