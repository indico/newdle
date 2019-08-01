import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Header} from 'semantic-ui-react';
import styles from './Timeline.module.scss';
import moment from 'moment';
import Participant from './Participant';

const overflowWidth = 0.5;

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
  return width > 0 ? width : overflowWidth;
}

function calculatePosition(start, minHour, maxHour) {
  const spanMins = (maxHour - minHour) * 60;
  let startMins = start.hours() * 60 + start.minutes() - minHour * 60;

  if (startMins < 0) {
    startMins = 0;
  }

  const position = (startMins / spanMins) * 100;
  return position < 100 ? position : 100 - overflowWidth;
}

function calculateBusyPositions(availability, minHour, maxHour) {
  return availability.map(({participant, busySlots}) => {
    const slots = busySlots.map(slot => {
      const start = moment(slot.startTime, 'HH:mm');
      const end = moment(slot.endTime, 'HH:mm');
      const segmentWidth = calculateWidth(start, end, minHour, maxHour);
      const segmentPosition = calculatePosition(start, minHour, maxHour);
      return {
        ...slot,
        width: segmentWidth,
        pos: segmentPosition,
      };
    });
    return {
      participant,
      busySlots: slots,
    };
  });
}

function BusySlot({width, pos, startTime, endTime, participantId}) {
  return (
    <div
      className={styles['busy-item']}
      key={`busy-slot-${participantId}-${startTime}-${endTime}`}
      style={{left: `${pos}%`, width: `${width}%`}}
    />
  );
}

BusySlot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  participantId: PropTypes.number.isRequired,
};

function BusyColumn({width, pos, startTime, endTime, participantId}) {
  return (
    <div
      className={styles['busy-column']}
      key={`busy-slot-${participantId}-${startTime}-${endTime}`}
      style={{left: `${pos}%`, width: `${width}%`}}
    />
  );
}

BusyColumn.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  participantId: PropTypes.number.isRequired,
};

function TimelineRow({participant, busySlots}) {
  return (
    <div className={styles['timeline-row']} key={`${participant.id}`}>
      <span className={styles['timeline-row-label']}>
        <Participant name={`${participant.firstName} ${participant.lastName}`} />
      </span>
      <div className={styles['timeline-busy']}>
        {busySlots.map(slot => (
          <BusySlot {...slot} participantId={participant.id} />
        ))}
      </div>
    </div>
  );
}

TimelineRow.propTypes = {
  participant: PropTypes.object.isRequired,
  busySlots: PropTypes.array.isRequired,
};

function TimelineContent({busySlots}) {
  return (
    <div className={styles['timeline-rows']}>
      {busySlots.map(({participant, busySlots}) => (
        <TimelineRow participant={participant} busySlots={busySlots} />
      ))}
      {busySlots.map(participant => {
        return participant.busySlots.map(slot => {
          return <BusyColumn {...slot} participantId={participant.participant.id} />;
        });
      })}
    </div>
  );
}

TimelineContent.propTypes = {
  busySlots: PropTypes.array.isRequired,
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
            {moment({hours: hourSeries[n]}).format('H:mm')}
          </span>
        </div>
      ))}
    </div>
  );
}

TimelineHeader.propTypes = {
  hourSeries: PropTypes.array.isRequired,
  hourSpan: PropTypes.number,
  hourStep: PropTypes.number,
};

export default function Timeline({date, availability, minHour, maxHour, hourStep}) {
  const hourSeries = _.range(minHour, maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;
  const busySlots = calculateBusyPositions(availability, minHour, maxHour);
  return (
    <div className={styles['timeline']}>
      <Header as="h2" className={styles['timeline-date']}>
        {moment(date, 'YYYY-MM-DD').format('D MMM YYYY')}
      </Header>
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
  minHour: 8,
  maxHour: 20,
  hourStep: 2,
};
