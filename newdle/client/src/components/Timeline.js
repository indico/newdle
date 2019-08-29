import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Header, Icon, Input, Popup} from 'semantic-ui-react';
import {getCalendarActiveDate, getDuration, getTimeslotsForActiveDate} from '../selectors';
import CandidateSlot from './CandidateSlot';
import DurationPicker from './DurationPicker';
import TimelineRow from './TimelineRow';
import TimelineHeader from './TimelineHeader';
import styles from './Timeline.module.scss';
import {addTimeslot, removeTimeslot} from '../actions';

const OVERFLOW_WIDTH = 0.5;
const DEFAULT_SLOT_START_TIME = '10:00';

function calculateWidth(start, end, minHour, maxHour) {
  let startMins = start.hours() * 60 + start.minutes();
  let endMins = end.hours() * 60 + end.minutes();

  if (startMins < minHour * 60) {
    startMins = minHour * 60;
  }
  if (endMins > maxHour * 60) {
    endMins = maxHour * 60;
  }
  const width = ((endMins - startMins) / ((maxHour - minHour) * 60)) * 100;
  return width > 0 ? width : OVERFLOW_WIDTH;
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
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
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
  const endTime = moment(startTime, 'HH:mm')
    .add(duration, 'm')
    .format('HH:mm');
  return getSlotProps(startTime, endTime, minHour, maxHour, duration);
}

function calculateBusyPositions(availability, minHour, maxHour) {
  return availability.map(({participant, busySlots}) => {
    const slots = busySlots.map(slot => getBusySlotProps(slot, minHour, maxHour));
    return {
      participant,
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
      const endTime = moment(candidate, 'HH:mm').add(duration, 'm');
      const nextCandidateStartTime = moment(sortedCandidates[i + 1], 'HH:mm');

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
  const date = useSelector(getCalendarActiveDate);
  const candidates = useSelector(getTimeslotsForActiveDate);
  const [edit, setEdit] = useState(!!candidates.length);
  const [timeslotTime, setTimeslotTime] = useState(DEFAULT_SLOT_START_TIME);
  const [newTimeslotPopupOpen, setTimeslotPopupOpen] = useState(false);

  const addNewSlotBtn = (
    <Icon
      className={`${styles['clickable']} ${styles['add-btn']}`}
      name="plus circle"
      size="large"
    />
  );

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

  return edit ? (
    <div className={`${styles['timeline-input']} ${styles['edit']}`}>
      <div className={styles['timeline-candidates']}>
        {groupedCandidates.map((rowCandidates, i) => (
          <div className={styles['candidates-group']} key={i}>
            {rowCandidates.map(time => {
              const slotProps = getCandidateSlotProps(time, duration, minHour, maxHour);
              return (
                <CandidateSlot
                  {...slotProps}
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
        trigger={addNewSlotBtn}
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
    <div className={`${styles['timeline-input']} ${styles['msg']}`} onClick={() => setEdit(true)}>
      <Icon name="plus circle" size="large" />
      Click to add time slots
    </div>
  );
}

TimelineInput.propTypes = {
  minHour: PropTypes.number.isRequired,
  maxHour: PropTypes.number.isRequired,
};

function TimelineContent({busySlots, minHour, maxHour}) {
  return (
    <div className={styles['timeline-rows']}>
      {busySlots.map(slot => (
        <TimelineRow {...slot} key={`${slot.participant.email}`} />
      ))}
      {busySlots.map(participant =>
        participant.busySlots.map(slot => {
          const key = `${participant.participant.email}-${slot.startTime}-${slot.endTime}`;
          return <BusyColumn {...slot} key={key} />;
        })
      )}
      <TimelineInput minHour={minHour} maxHour={maxHour} />
    </div>
  );
}

TimelineContent.propTypes = {
  busySlots: PropTypes.array.isRequired,
  minHour: PropTypes.number,
  maxHour: PropTypes.number,
};

TimelineContent.defaultProps = {
  minHour: 6,
  maxHour: 24,
};

export default function Timeline({date, availability, minHour, maxHour, hourStep}) {
  const hourSeries = _.range(minHour, maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;
  const busySlots = calculateBusyPositions(availability, minHour, maxHour);
  return (
    <div className={styles['timeline']}>
      <div className={styles['timeline-title']}>
        <Header as="h2" className={styles['timeline-date']}>
          {moment(date, 'YYYY-MM-DD').format('D MMM YYYY')}
        </Header>
        <DurationPicker />
      </div>
      <TimelineHeader hourSeries={hourSeries} hourSpan={hourSpan} hourStep={hourStep} />
      <TimelineContent busySlots={busySlots} />
    </div>
  );
}

Timeline.propTypes = {
  date: PropTypes.string.isRequired,
  availability: PropTypes.array.isRequired,
  minHour: PropTypes.number,
  maxHour: PropTypes.number,
  hourStep: PropTypes.number,
};

Timeline.defaultProps = {
  minHour: 6,
  maxHour: 24,
  hourStep: 2,
};
