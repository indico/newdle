import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Header, Icon, Input, Popup} from 'semantic-ui-react';
import {
  getCreationCalendarActiveDate,
  getDuration,
  getTimeslotsForActiveDate,
} from '../../../selectors';
import CandidateSlot from './CandidateSlot';
import DurationPicker from './DurationPicker';
import TimezonePicker from './TimezonePicker';
import TimelineRow from './TimelineRow';
import TimelineHeader from './TimelineHeader';
import {addTimeslot, removeTimeslot} from '../../../actions';
import {toMoment, getHourSpan} from '../../../util/date';
import styles from './Timeline.module.scss';

const OVERFLOW_WIDTH = 0.5;
const DEFAULT_SLOT_START_TIME = '10:00';
const DEFAULT_TIME_FORMAT = 'HH:mm';

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
  return getSlotProps(startTime, endTime, minHour, maxHour, duration);
}

function calculateBusyPositions(availability, minHour, maxHour) {
  return availability.map(({participant, busySlotsLoading, busySlots}) => {
    const slots = busySlots.map(slot => getBusySlotProps(slot, minHour, maxHour));
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
  const [editing, setEditing] = useState(!!candidates.length);
  const [timeslotTime, setTimeslotTime] = useState(DEFAULT_SLOT_START_TIME);
  const [newTimeslotPopupOpen, setTimeslotPopupOpen] = useState(false);

  const handleStartEditing = () => {
    setEditing(true);
    setTimeslotPopupOpen(true);
  };

  const handlePopupClose = () => {
    setTimeslotPopupOpen(false);
    setTimeslotTime(DEFAULT_SLOT_START_TIME);
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
              return (
                <CandidateSlot
                  {...slotProps}
                  key={time}
                  isValidTime={time => !candidates.includes(time)}
                  onDelete={() => handleRemoveSlot(time)}
                  onChangeSlotTime={newStartTime => handleUpdateSlot(time, newStartTime)}
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
        content={
          <>
            <Input
              autoFocus
              className={styles['time-input']}
              type="time"
              action={{
                icon: 'check',
                disabled: !timeslotTime || candidates.includes(timeslotTime),
                onClick: () => {
                  handleAddSlot(timeslotTime);
                  handlePopupClose();
                },
              }}
              value={timeslotTime}
              onKeyDown={e => {
                const canBeAdded = timeslotTime && !candidates.includes(timeslotTime);
                if (e.key === 'Enter' && canBeAdded) {
                  handleAddSlot(timeslotTime);
                  handlePopupClose();
                }
              }}
              onChange={e => setTimeslotTime(e.target.value)}
            />
          </>
        }
      />
    </div>
  ) : (
    <div className={`${styles['timeline-input']} ${styles['msg']}`} onClick={handleStartEditing}>
      <Icon name="plus circle" size="large" />
      Click to add time slots
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
  const [[minHour, maxHour], setHourSpan] = useState([defaultMinHour, defaultMaxHour]);
  const candidates = useSelector(getTimeslotsForActiveDate);
  const duration = useSelector(getDuration);
  const hourSeries = _.range(minHour, maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;
  const defaultHourSpan = defaultMaxHour - defaultMinHour;
  const busySlots = calculateBusyPositions(availability, minHour, maxHour);

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
      <div className={styles['timeline-title']}>
        <Header as="h2" className={styles['timeline-date']}>
          {toMoment(date, 'YYYY-MM-DD').format('D MMM YYYY')}
        </Header>
        <div className={styles['config-box']}>
          <DurationPicker />
          <TimezonePicker />
        </div>
      </div>
      <TimelineHeader hourSeries={hourSeries} hourSpan={hourSpan} hourStep={hourStep} />
      <TimelineContent busySlots={busySlots} minHour={minHour} maxHour={maxHour} />
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
  defaultMinHour: 6,
  defaultMaxHour: 24,
  hourStep: 2,
};
