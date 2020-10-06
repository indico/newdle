import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Trans, t, plural} from '@lingui/macro';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import TimePicker from 'rc-time-picker';
import {Header, Icon, Popup, Button, Grid} from 'semantic-ui-react';
import {addTimeslot, removeTimeslot, setTimezone} from '../../../actions';
import {
  getCreationCalendarActiveDate,
  getDuration,
  getTimeslotsForActiveDate,
  getNewTimeslotStartTime,
  getPreviousDayTimeslots,
  getTimezone,
  getParticipantAvailability,
} from '../../../selectors';
import {hourRange, toMoment, getHourSpan, DEFAULT_TIME_FORMAT} from '../../../util/date';
import {useIsSmallScreen} from '../../../util/hooks';
import TimezonePicker from '../../common/TimezonePicker';
import CandidateSlot from './CandidateSlot';
import DurationPicker from './DurationPicker';
import TimelineHeader from './TimelineHeader';
import TimelineRow from './TimelineRow';
import 'rc-time-picker/assets/index.css';
import styles from './Timeline.module.scss';

const OVERFLOW_WIDTH = 0.5;

function calculateWidth(start, end, minHour, maxHour) {
  let startMins = start.hours() * 60 + start.minutes();
  let endMins = end.hours() * 60 + end.minutes();

  startMins = Math.max(startMins, minHour * 60);
  endMins = Math.min(endMins, maxHour * 60);

  if (endMins < startMins) {
    // end is beyond 24:00 of the current day
    endMins = 24 * 60;
  }

  return ((endMins - startMins) / ((maxHour - minHour) * 60)) * 100;
}

function calculatePosition(start, minHour, maxHour) {
  const spanMins = (maxHour - minHour) * 60;
  let startMins = start.hours() * 60 + start.minutes() - minHour * 60;

  if (startMins < 0) {
    startMins = 0;
  }

  const position = (startMins / spanMins) * 100;
  return position < 100 ? position : 100 - OVERFLOW_WIDTH;
}

function getSlotProps(startTime, endTime, minHour, maxHour) {
  const start = toMoment(startTime, DEFAULT_TIME_FORMAT);
  const end = toMoment(endTime, DEFAULT_TIME_FORMAT);
  return {
    startTime,
    endTime,
    width: calculateWidth(start, end, minHour, maxHour),
    pos: calculatePosition(start, minHour, maxHour),
    key: `${startTime}-${endTime}`,
  };
}

function getBusySlotProps(slot, minHour, maxHour) {
  return getSlotProps(slot.startTime, slot.endTime, minHour, maxHour);
}

function getCandidateSlotProps(startTime, duration, minHour, maxHour) {
  const endTime = toMoment(startTime, DEFAULT_TIME_FORMAT)
    .add(duration, 'm')
    .format(DEFAULT_TIME_FORMAT);
  return getSlotProps(startTime, endTime, minHour, maxHour);
}

/**
 * Remove all slots which fall outside [minHour, maxHour] and "trim" those which
 * are partially outside of it.
 */
function trimOverflowingSlots(slots, minHour, maxHour) {
  const minTime = toMoment(`${minHour}:00`, DEFAULT_TIME_FORMAT);
  const maxTime = toMoment(`${maxHour}:00`, DEFAULT_TIME_FORMAT);
  return _.without(
    slots.map(({startTime, endTime}) => {
      startTime = toMoment(startTime, DEFAULT_TIME_FORMAT);
      endTime = toMoment(endTime, DEFAULT_TIME_FORMAT);

      // if startTime > endTime, then we're referring to the next day
      if (startTime.isAfter(endTime)) {
        endTime.add(1, 'd');
      }

      // interval completely outside the hour range
      if (moment(endTime).isBefore(minTime) || moment(startTime).isSameOrAfter(maxTime)) {
        return null;
      }

      startTime = moment.max(startTime, minTime);
      endTime = moment.min(endTime, maxTime);

      return startTime.isSame(endTime)
        ? null
        : {
            startTime: startTime.format(DEFAULT_TIME_FORMAT),
            endTime: endTime.format(DEFAULT_TIME_FORMAT),
          };
    }),
    null
  );
}

function calculateBusyPositions(availability, minHour, maxHour) {
  return availability.map(({participant, busySlotsLoading, busySlots}) => {
    const slots = trimOverflowingSlots(busySlots, minHour, maxHour).map(slot =>
      getBusySlotProps(slot, minHour, maxHour)
    );
    return {
      participant,
      busySlotsLoading,
      busySlots: slots,
    };
  });
}

function splitOverlappingCandidates(candidates, duration) {
  let current = [];
  const groupedCandidates = [];
  const sortedCandidates = candidates.sort();
  for (let i = 0; i < sortedCandidates.length; i++) {
    const candidate = sortedCandidates[i];
    if (i + 1 >= sortedCandidates.length) {
      current.push(candidate);
    } else {
      const endTime = toMoment(candidate, DEFAULT_TIME_FORMAT).add(duration, 'm');
      const nextCandidateStartTime = toMoment(sortedCandidates[i + 1], DEFAULT_TIME_FORMAT);

      if (nextCandidateStartTime.isSameOrBefore(endTime)) {
        groupedCandidates.push([...current, candidate]);
        current = [];
      } else {
        current.push(candidate);
      }
    }
  }
  return [...groupedCandidates, current];
}

function BusyColumn({width, pos}) {
  return <div className={styles['busy-column']} style={{left: `${pos}%`, width: `${width}%`}} />;
}

BusyColumn.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
};

function TimelineInput({minHour, maxHour}) {
  const dispatch = useDispatch();
  const duration = useSelector(getDuration);
  const date = useSelector(getCreationCalendarActiveDate);
  const candidates = useSelector(getTimeslotsForActiveDate);
  const pastCandidates = useSelector(getPreviousDayTimeslots);
  const availability = useSelector(getParticipantAvailability);
  const [editing, setEditing] = useState(!!candidates.length);
  const latestStartTime = useSelector(getNewTimeslotStartTime);
  const [timeslotTime, setTimeslotTime] = useState(latestStartTime);
  const [newTimeslotPopupOpen, setTimeslotPopupOpen] = useState(false);

  useEffect(() => {
    setTimeslotTime(latestStartTime);
  }, [latestStartTime, candidates, duration]);

  const handleStartEditing = () => {
    setEditing(true);
    setTimeslotPopupOpen(true);
  };

  const handleCopyClick = () => {
    pastCandidates.forEach(time => {
      dispatch(addTimeslot(date, time));
    });
    setEditing(true);
  };

  const handlePopupClose = () => {
    setTimeslotPopupOpen(false);
  };

  const handleAddSlot = time => {
    dispatch(addTimeslot(date, time));
  };

  const handleRemoveSlot = time => {
    dispatch(removeTimeslot(date, time));
  };

  const handleUpdateSlot = (oldTime, newTime) => {
    dispatch(removeTimeslot(date, oldTime));
    dispatch(addTimeslot(date, newTime));
  };

  const groupedCandidates = splitOverlappingCandidates(candidates, duration);

  return editing ? (
    <div className={`${styles['timeline-input']} ${styles['edit']}`}>
      <div className={styles['timeline-candidates']}>
        {groupedCandidates.map((rowCandidates, i) => (
          <div className={styles['candidates-group']} key={i}>
            {rowCandidates.map(time => {
              const slotProps = getCandidateSlotProps(time, duration, minHour, maxHour);
              const participants = availability?.find(a => a.startDt === `${date}T${time}`);
              return (
                <CandidateSlot
                  {...slotProps}
                  key={time}
                  isValidTime={time => !candidates.includes(time)}
                  onDelete={() => handleRemoveSlot(time)}
                  onChangeSlotTime={newStartTime => handleUpdateSlot(time, newStartTime)}
                  text={
                    participants &&
                    plural(participants.availableCount, {
                      zero: 'No participants registered',
                      one: '# participant registered',
                      other: '# participants registered',
                    })
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
      <Popup
        trigger={
          <Icon
            className={`${styles['clickable']} ${styles['add-btn']}`}
            name="plus circle"
            size="large"
          />
        }
        on="click"
        position="bottom center"
        onOpen={() => setTimeslotPopupOpen(true)}
        onClose={handlePopupClose}
        open={newTimeslotPopupOpen}
        onKeyDown={evt => {
          const canBeAdded = timeslotTime && !candidates.includes(timeslotTime);
          if (evt.key === 'Enter' && canBeAdded) {
            handleAddSlot(timeslotTime);
            handlePopupClose();
          }
        }}
        className={styles['timepicker-popup']}
        content={
          <>
            <TimePicker
              showSecond={false}
              value={toMoment(timeslotTime, DEFAULT_TIME_FORMAT)}
              format={DEFAULT_TIME_FORMAT}
              onChange={time => setTimeslotTime(time ? time.format(DEFAULT_TIME_FORMAT) : null)}
              allowEmpty={false}
              // keep the picker in the DOM tree of the surrounding element
              getPopupContainer={node => node}
            />
            <Button
              icon
              onClick={() => {
                handleAddSlot(timeslotTime);
                handlePopupClose();
              }}
              disabled={!timeslotTime || candidates.includes(timeslotTime)}
            >
              <Icon name="check" />
            </Button>
          </>
        }
      />
    </div>
  ) : (
    <div className={styles['timeline-input-wrapper']}>
      <div className={`${styles['timeline-input']} ${styles['msg']}`} onClick={handleStartEditing}>
        <Icon name="plus circle" size="large" />
        <Trans>Click to add time slots</Trans>
      </div>
      {pastCandidates && (
        <div className={`${styles['timeline-input']} ${styles['msg']}`} onClick={handleCopyClick}>
          <Icon name="copy" size="large" />
          <Trans>Copy time slots from previous day</Trans>
        </div>
      )}
    </div>
  );
}

TimelineInput.propTypes = {
  minHour: PropTypes.number.isRequired,
  maxHour: PropTypes.number.isRequired,
};

function TimelineContent({busySlots: allBusySlots, minHour, maxHour}) {
  return (
    <div className={styles['timeline-rows']}>
      {allBusySlots.map(slot => (
        <TimelineRow {...slot} key={slot.participant.email} />
      ))}
      {allBusySlots.map(({busySlots, participant}) =>
        busySlots.map(slot => {
          const key = `${participant.email}-${slot.startTime}-${slot.endTime}`;
          return <BusyColumn {...slot} key={key} />;
        })
      )}
      <TimelineInput minHour={minHour} maxHour={maxHour} />
    </div>
  );
}

TimelineContent.propTypes = {
  busySlots: PropTypes.array.isRequired,
  minHour: PropTypes.number.isRequired,
  maxHour: PropTypes.number.isRequired,
};

export default function Timeline({date, availability, defaultMinHour, defaultMaxHour, hourStep}) {
  const isTabletOrMobile = useIsSmallScreen();
  const [[minHour, maxHour], setHourSpan] = useState([defaultMinHour, defaultMaxHour]);
  const candidates = useSelector(getTimeslotsForActiveDate);
  const duration = useSelector(getDuration);
  const hourSeries = hourRange(minHour, maxHour, hourStep);
  const hourSpan = maxHour - minHour;
  const defaultHourSpan = defaultMaxHour - defaultMinHour;
  const busySlots = calculateBusyPositions(availability, minHour, maxHour);
  const timezone = useSelector(getTimezone);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!candidates.length) {
      setHourSpan([defaultMinHour, defaultMaxHour]);
      return;
    }
    const format = DEFAULT_TIME_FORMAT;
    const input = {
      timeSlots: candidates,
      defaultHourSpan,
      defaultMaxHour,
      defaultMinHour,
      duration,
      format,
    };
    setHourSpan(getHourSpan(input));
  }, [candidates, defaultHourSpan, defaultMaxHour, defaultMinHour, duration]);

  return (
    <div className={styles['timeline']}>
      <Grid>
        <Grid.Row className={styles['timeline-title']}>
          <Grid.Column>
            <Grid stackable textAlign={isTabletOrMobile ? 'left' : 'right'}>
              <Grid.Column computer={6} tablet={16}>
                <Header as="h2" className={styles['timeline-date']}>
                  {toMoment(date, 'YYYY-MM-DD').format('D MMM YYYY')}
                </Header>
              </Grid.Column>
              <Grid.Column computer={10} tablet={16}>
                <div className={styles['config-box']}>
                  <DurationPicker />
                  <TimezonePicker
                    onChange={value => dispatch(setTimezone(value))}
                    currentTz={timezone}
                    title={t`Timezone`}
                    selection
                  />
                </div>
              </Grid.Column>
            </Grid>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <div className={styles['timeline-slot-picker']}>
              <TimelineHeader hourSeries={hourSeries} hourSpan={hourSpan} hourStep={hourStep} />
              <TimelineContent busySlots={busySlots} minHour={minHour} maxHour={maxHour} />
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}

Timeline.propTypes = {
  date: PropTypes.string.isRequired,
  availability: PropTypes.array.isRequired,
  defaultMinHour: PropTypes.number,
  defaultMaxHour: PropTypes.number,
  hourStep: PropTypes.number,
};

Timeline.defaultProps = {
  defaultMinHour: 8,
  defaultMaxHour: 24,
  hourStep: 2,
};
