import React from 'react';
import Participant from './Participant';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Header} from 'semantic-ui-react';
import styles from './Timeline.module.scss';
import moment from 'moment';

function calculateWidth(start, end, minHour, maxHour) {
  let startMins = start.hours() * 60 + start.minutes();
  let endMins = end.hours() * 60 + end.minutes();

  if (startMins < minHour * 60) {
    startMins = minHour * 60;
  }
  if (endMins > maxHour * 60) {
    endMins = maxHour * 60;
  }

  return ((endMins - startMins) / ((maxHour - minHour) * 60)) * 100;
}

function calculatePosition(start, minHour, maxHour) {
  const spanMins = (maxHour - minHour) * 60;
  let startMins = start.hours() * 60 + start.minutes() - minHour * 60;

  if (startMins < 0) {
    startMins = 0;
  } else if (startMins >= spanMins) {
    startMins = spanMins - 5;
  }

  return (startMins / spanMins) * 100;
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

function renderParticipant(participant) {
  return (
    <span className={styles['timeline-row-label']}>
      {<Participant name={`${participant.firstName} ${participant.lastName}`} />}
    </span>
  );
}

function renderBusySlot({width, pos}, key) {
  return (
    <div
      className={styles['busy-item']}
      key={`timeline-busy-${key}`}
      style={{left: `${pos}%`, width: `${width}%`}}
    />
  );
}

function renderBusyColumn({width, pos}) {
  return <div className={styles['busy-column']} style={{left: `${pos}%`, width: `${width}%`}} />;
}

function renderTimelineRow({participant, busySlots}, key) {
  return (
    <div className={styles['timeline-row']} key={`row-${key}`}>
      {renderParticipant(participant)}
      <div className={styles['timeline-busy']}>
        {busySlots.map((slot, i) => renderBusySlot(slot, i))}
      </div>
    </div>
  );
}

function renderTimelineContent(availability) {
  return (
    <div className={styles['timeline-rows']}>
      {availability.map((avail, i) => renderTimelineRow(avail, i))}
      {availability.map(participant => {
        return participant.busySlots.map(slot => renderBusyColumn(slot));
      })}
    </div>
  );
}

function renderTimelineHeader(hourSeries, hourSpan, hourStep) {
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

export default function Timeline({date, availability, minHour, maxHour, hourStep}) {
  const hourSeries = _.range(minHour, maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;
  const busySlots = calculateBusyPositions(availability, minHour, maxHour);
  return (
    <div className={styles['timeline']}>
      <Header as="h2" className={styles['timeline-date']}>
        {moment(date, 'YYYY-MM-DD').format('D MMM YYYY')}
      </Header>
      {renderTimelineHeader(hourSeries, hourSpan, hourStep)}
      {renderTimelineContent(busySlots)}
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
