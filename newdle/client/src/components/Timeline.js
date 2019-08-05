import _ from 'lodash';
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Header, Icon, Popup, Input} from 'semantic-ui-react';
import UserAvatar from './UserAvatar';
import DurationPicker from './DurationPicker';
import styles from './Timeline.module.scss';

const OVERFLOW_WIDTH = 0.5;

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

function calculateSlotProps(slot, minHour, maxHour) {
  const start = moment(slot.startTime, 'HH:mm');
  const end = moment(slot.endTime, 'HH:mm');
  const segmentWidth = calculateWidth(start, end, minHour, maxHour);
  const segmentPosition = calculatePosition(start, minHour, maxHour);
  const key = `${slot.startTime}-${slot.endTime}`;
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

function Slot({width, pos, moreStyles, onClick}) {
  return (
    <div
      onClick={onClick}
      className={`${styles['slot']} ${moreStyles}`}
      style={{left: `${pos}%`, width: `${width}%`}}
    />
  );
}

Slot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  moreStyles: PropTypes.string,
};

Slot.defaultProps = {
  moreStyles: '',
};

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

function CandidateSlot({width, pos}) {
  const slot = <Slot width={width} pos={pos} moreStyles={styles['candidate']} />;
  const content = <Input action={{icon: 'check'}} />;
  return <Popup on="click" content={content} trigger={slot} position="bottom center" />;
}

CandidateSlot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
};

function TimelineInput({minHour, maxHour}) {
  const candidatesExample = [
    {
      id: 1,
      startTime: '8:00',
      endTime: '10:30',
    },
    {
      id: 2,
      startTime: '13:30',
      endTime: '14:45',
    },
  ];
  const [edit, setEdit] = useState(false);
  const [candidates, setCandidates] = useState(candidatesExample);
  return edit ? (
    <div className={`${styles['timeline-input']} ${styles['edit']}`}>
      {candidates.map(slot => {
        const slotProps = calculateSlotProps(slot, minHour, maxHour);
        return <CandidateSlot {...slotProps} />;
      })}
      <Icon className={styles['add-btn']} name="plus circle" size="large" />
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
