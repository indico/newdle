import _ from 'lodash';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Header, Icon, Popup, Input} from 'semantic-ui-react';
import {getDuration} from '../selectors';
import UserAvatar from './UserAvatar';
import DurationPicker from './DurationPicker';
import Slot from './Slot';
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

function calculateSlotProps(slot, minHour, maxHour, duration = null) {
  const {startTime, endTime} = duration
    ? calculateSlotTimes(slot.startTime, duration)
    : {startTime: slot.startTime, endTime: slot.endTime};
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
  const segmentWidth = calculateWidth(start, end, minHour, maxHour);
  const segmentPosition = calculatePosition(start, minHour, maxHour);
  const key = `${startTime}-${endTime}`;
  return {
    ...slot,
    width: segmentWidth,
    pos: segmentPosition,
    key,
  };
}

function calculateBusyPositions(availability, minHour, maxHour) {
  return availability.map(({participant, busySlots}) => {
    const slots = busySlots.map(slot => calculateSlotProps(slot, minHour, maxHour));
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

function BusyColumn({width, pos}) {
  return <div className={styles['busy-column']} style={{left: `${pos}%`, width: `${width}%`}} />;
}

BusyColumn.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
};

function TimelineRow({participant, busySlots}) {
  return (
    <div className={styles['timeline-row']}>
      <span className={styles['timeline-row-label']}>
        <UserAvatar user={participant} className={styles['avatar']} size={30} withLabel />
      </span>
      <div className={styles['timeline-busy']}>
        {busySlots.map(slot => (
          <Slot {...slot} />
        ))}
      </div>
    </div>
  );
}

TimelineRow.propTypes = {
  participant: PropTypes.object.isRequired,
  busySlots: PropTypes.array.isRequired,
};

function CandidateSlot({width, pos, startTime, onDelete, onChangeSlotTime}) {
  const [value, setValue] = useState(startTime);

  const handleInputChange = e => {
    // TODO: Input validation, timepicker widget?
    setValue(e.target.value);
  };

  const slot = (
    <Slot width={width} pos={pos} moreStyles={styles['candidate']}>
      <Icon
        name="times circle outline"
        onClick={onDelete}
        className={`${styles['clickable']} ${styles['delete-btn']}`}
      />
    </Slot>
  );
  const content = (
    <Input
      action={{
        icon: 'check',
        onClick: () => onChangeSlotTime(value),
      }}
      onChange={handleInputChange}
      defaultValue={value}
    />
  );
  return <Popup on="click" content={content} trigger={slot} position="bottom center" />;
}

CandidateSlot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  startTime: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChangeSlotTime: PropTypes.func.isRequired,
};

function TimelineInput({minHour, maxHour}) {
  const duration = useSelector(getDuration);
  const [edit, setEdit] = useState(false);
  const [candidates, setCandidates] = useState([]);
  return edit ? (
    <div className={`${styles['timeline-input']} ${styles['edit']}`}>
      {candidates.map((slot, index) => {
        const slotProps = calculateSlotProps(slot, minHour, maxHour, duration);
        return (
          <CandidateSlot
            {...slotProps}
            onDelete={e => {
              e.stopPropagation();
              setCandidates(candidates.filter((_, i) => index !== i));
            }}
            onChangeSlotTime={newStartTime => {
              const newCandidates = candidates.slice();
              newCandidates[index].startTime = newStartTime;
              setCandidates(newCandidates);
            }}
          />
        );
      })}
      <Icon
        className={`${styles['clickable']} ${styles['add-btn']}`}
        name="plus circle"
        size="large"
        onClick={() => {
          // TODO: Avoid letting to add two slots in the same range
          setCandidates(candidates.concat({startTime: DEFAULT_SLOT_START_TIME}));
        }}
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

function TimelineHeader({hourSeries, hourSpan, hourStep}) {
  return (
    <div className={styles['timeline-hours']}>
      {_.range(0, hourSpan + hourStep, hourStep).map((i, n) => (
        <div
          className={styles['timeline-hour']}
          key={`timeline-label-${i}`}
          style={{left: `${(i / hourSpan) * 100}%`}}
        >
          <span className={styles['timeline-hour-text']}>
            {moment({hours: hourSeries[n]}).format('k')}
          </span>
        </div>
      ))}
    </div>
  );
}

TimelineHeader.propTypes = {
  hourSeries: PropTypes.array.isRequired,
  hourSpan: PropTypes.number.isRequired,
  hourStep: PropTypes.number.isRequired,
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
