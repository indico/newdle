import 'moment-timezone';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {Redirect} from 'react-router-dom';
import {t, Trans} from '@lingui/macro';
import _ from 'lodash';
import moment from 'moment';
import {
  Loader,
  Button,
  Container,
  Input,
  Checkbox,
  Radio,
  Header,
  Icon,
  Popup,
} from 'semantic-ui-react';
import {serializeDate} from 'src/util/date';
import {getCreatedNewdle, isLoggedIn} from '../../selectors';
import {usePageTitle} from '../../util/hooks';
import styles from './creation.module.scss';

export default function ClonePage() {
  const isUserLoggedIn = useSelector(isLoggedIn);
  const newdle = useSelector(getCreatedNewdle);
  const history = useHistory();
  const [keepSettings, setKeepSettings] = useState(true);
  const [keepParticipants, setKeepParticipants] = useState(true);
  const [keepTimeslots, setKeepTimeslots] = useState(true);
  const [option, setOption] = useState('keep');
  const [startDate, setStartDate] = useState(serializeDate(moment()));
  usePageTitle(t`Cloning newdle`);

  if (!isUserLoggedIn) {
    return <Redirect to="/" />;
  }
  if (!newdle) {
    return <Loader active />;
  }

  const hasParticipantsWithoutEmail = newdle.participants.some(p => p.email === null);

  function cloneNewdle() {
    const dayOffset = getDayOffset(newdle.timeslots, newdle.timezone, option, startDate);
    history.push({
      pathname: `/new`,
      state: {
        cloneData: {
          duration: newdle.duration,
          timezone: newdle.timezone,
          title: keepSettings ? newdle.title : null,
          private: keepSettings ? newdle.private : null,
          notify: keepSettings ? newdle.notify : null,
          participants: keepParticipants
            ? // Remove participant data (answers, comments) coming from the original newdle.
              // Participant id is needed for a key in <UserSearch> since email might be missing here.
              newdle.participants.map(p =>
                _.pick(p, ['id', 'uid', 'auth_uid', 'signature', 'avatar_url', 'email', 'name'])
              )
            : [],
          timeslots: keepTimeslots
            ? moveTimeslots(newdle.timeslots, newdle.timezone, dayOffset)
            : [],
        },
      },
    });
  }

  const hasTimeslotsInPast = newdle.timeslots.some(slot =>
    moment.tz(slot, newdle.timezone).isBefore()
  );
  const radioLabel = hasTimeslotsInPast ? (
    <>
      <Trans>Keep the timeslots as they are</Trans>
      <Popup
        content={t`Some of the current timeslots are in the past`}
        trigger={<Icon style={{marginLeft: 5}} name="warning circle" />}
      />
    </>
  ) : (
    <Trans>Keep the timeslots as they are</Trans>
  );

  const canSubmit = keepSettings || keepParticipants || keepTimeslots;

  return (
    <Container text>
      <div className={styles['advanced-options']} style={{marginTop: 0}}>
        <div className={styles['headerbar']}>
          <Header as="h3" className={styles['header']}>
            <Trans>Cloning options</Trans>
          </Header>
        </div>
        <div className={styles['options']}>
          <div>
            <label htmlFor="keepSettings">
              <Trans>Keep title and settings</Trans>
            </label>
            <Checkbox
              className={styles['advanced-checkbox']}
              id="keepSettings"
              toggle
              checked={keepSettings}
              onChange={(_, {checked}) => setKeepSettings(checked)}
            />
          </div>
          <div>
            <label htmlFor="keepParticipants">
              {hasParticipantsWithoutEmail ? (
                <>
                  <Trans>Keep list of participants</Trans>
                  <Popup
                    content={t`Some participants were not logged in and will be skipped in the cloned newdle.`}
                    trigger={<Icon style={{marginLeft: 5}} name="warning circle" />}
                  />
                </>
              ) : (
                <Trans>Keep list of participants</Trans>
              )}
            </label>
            <Checkbox
              className={styles['advanced-checkbox']}
              id="keepParticipants"
              toggle
              checked={keepParticipants}
              onChange={(_, {checked}) => setKeepParticipants(checked)}
            />
          </div>
          <div>
            <label htmlFor="keepTimeslots">
              <Trans>Keep timeslots</Trans>
            </label>
            <Checkbox
              className={styles['advanced-checkbox']}
              id="keepTimeslots"
              toggle
              checked={keepTimeslots}
              onChange={(_, {checked}) => setKeepTimeslots(checked)}
            />
          </div>
          {keepTimeslots && (
            <div className={styles['timeslot-options']}>
              <Radio
                className={styles['radio']}
                label={{children: radioLabel}}
                name="timeslotOptions"
                checked={option === 'keep'}
                onChange={() => setOption('keep')}
              />
              <Radio
                className={styles['radio']}
                label={t`Set the timeslots to start at a specific date`}
                name="timeslotOptions"
                checked={option === 'move'}
                onChange={() => setOption('move')}
              />
              {option === 'move' && (
                <div className={styles['date-input']}>
                  <span>
                    <Trans>Starting date:</Trans>
                  </span>
                  <Input
                    required
                    type="date"
                    size="small"
                    value={startDate}
                    error={startDate === ''}
                    onChange={(_, data) => setStartDate(data.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles['create-button']}>
        <Button color="violet" type="submit" disabled={!canSubmit} onClick={cloneNewdle}>
          <Trans>Review cloned newdle</Trans> 🍜
        </Button>
      </div>
    </Container>
  );
}

function getDayOffset(timeslots, tz, option, startDate) {
  if (option === 'keep' || timeslots.length === 0) {
    return 0;
  } else {
    const newStart = moment.tz(startDate, tz);
    const oldStart = moment.tz(timeslots[0], tz);
    oldStart.set({hour: 0, minute: 0, second: 0, millisecond: 0});
    return newStart.diff(oldStart, 'days');
  }
}

function moveTimeslots(timeslots, tz, dayOffset) {
  return timeslots.map(slot =>
    serializeDate(moment.tz(slot, tz).add(dayOffset, 'days'), moment.HTML5_FMT.DATETIME_LOCAL)
  );
}
