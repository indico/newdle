import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import shortid from 'shortid';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {Header, Icon, Input, Popup} from 'semantic-ui-react';
import {getDuration} from '../selectors';
import {CandidateSlot} from './Slot';
import DurationPicker from './DurationPicker';
import TimelineRow from './TimelineRow';
import TimelineHeader from './TimelineHeader';
import styles from './Timeline.module.scss';

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

function getSlotProps(slot, minHour, maxHour, duration = null) {
  const {startTime, endTime} = duration
    ? calculateSlotTimes(slot.startTime, duration)
    : {startTime: slot.startTime, endTime: slot.endTime};
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
  const segmentWidth = calculateWidth(start, end, minHour, maxHour);
  const segmentPosition = calculatePosition(start, minHour, maxHour);
  const key = `${slot.id || ''}${startTime}-${endTime}`;
  return {
    ...slot,
    width: segmentWidth,
    pos: segmentPosition,
    key,
  };
}

function calculateBusyPositions(availability, minHour, maxHour) {
  return availability.map(({participant, busySlots}) => {
    const slots = busySlots.map(slot => getSlotProps(slot, minHour, maxHour));
    return {
      participant,
      busySlots: slots,
    };
  });
}

function calculateSlotTimes(startTime, duration) {
  const endTime = moment(startTime, 'HH:mm')
    .add(duration, 'm')
    .format('HH:mm');
  return {startTime, endTime};
}

function splitOverlappingCandidates(candidates, duration) {
  let current = [];
  const groupedCandidates = [];
  const sortedCandidates = _.sortBy(candidates, 'startTime');
  for (let i = 0; i < sortedCandidates.length; i++) {
    const candidate = sortedCandidates[i];
    if (i + 1 >= sortedCandidates.length) {
      current.push(candidate);
    } else {
      const endTime = moment(candidate.startTime, 'HH:mm').add(duration, 'm');
      const nextCandidateStartTime = moment(sortedCandidates[i + 1].startTime, 'HH:mm');

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
  const duration = useSelector(getDuration);
  const [edit, setEdit] = useState(false);
  const [candidates, setCandidates] = useState([]);
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
  const groupedCandidates = splitOverlappingCandidates(candidates, duration);

  return edit ? (
    <div className={`${styles['timeline-input']} ${styles['edit']}`}>
      <div className={styles['timeline-candidates']}>
        {groupedCandidates.map((rowCandidates, i) => (
          <div className={styles['candidates-group']} key={i}>
            {rowCandidates.map(slot => {
              const slotProps = getSlotProps(slot, minHour, maxHour, duration);
              return (
                <CandidateSlot
                  {...slotProps}
                  canEdit={time => !candidates.find(it => it.startTime === time)}
                  onDelete={e => {
                    e.stopPropagation();
                    setCandidates(candidates.filter(cand => cand.id !== slot.id));
                  }}
                  onChangeSlotTime={newStartTime => {
                    const newCandidates = candidates.slice();
                    const index = newCandidates.findIndex(cand => cand.id === slot.id);
                    newCandidates[index].startTime = newStartTime;
                    setCandidates(newCandidates);
                  }}
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
              className={styles['time-input']}
              type="time"
              action={{
                icon: 'check',
                disabled: !timeslotTime || !!candidates.find(it => it.startTime === timeslotTime),
                onClick: () => {
                  setCandidates(
                    candidates.concat({startTime: timeslotTime, id: shortid.generate()})
                  );
                  handlePopupClose();
                },
              }}
              value={timeslotTime}
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
  minHour: PropTypes.number,
  maxHour: PropTypes.number,
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
