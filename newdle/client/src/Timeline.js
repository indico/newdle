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

function renderParticipant(participant) {
  return (
    <span className={styles['timeline-row-label']}>
      {<Participant name={`${participant.firstName} ${participant.lastName}`} />}
    </span>
  );
}

function renderBusy({startTime, endTime}, i, minHour, maxHour) {
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
  const segmentWidth = calculateWidth(start, end, minHour, maxHour);
  const segmentPosition = calculatePosition(start, minHour, maxHour);
  return (
    <div
      className={styles['busy-item']}
      key={`timeline-busy-${i}`}
      style={{left: `${segmentPosition}%`, width: `${segmentWidth}%`}}
    ></div>
  );
}

function renderRow({participant, busySlots}, i, minHour, maxHour) {
  return (
    <div className={styles['timeline-row']} key={`row-${i}`}>
      {renderParticipant(participant)}
      <div className={styles['timeline-busy']}>
        {busySlots.map((slot, i) => renderBusy(slot, i, minHour, maxHour))}
      </div>
    </div>
  );
}

function renderRows(availability, minHour, maxHour) {
  return (
    <div className={styles['timeline-rows']}>
      {availability.map((avail, i) => renderRow(avail, i, minHour, maxHour))}
      {renderBusyColumns(availability, minHour, maxHour)}
    </div>
  );
}

function renderHeader(hourSeries, hourSpan, hourStep) {
  return (
    <div className={styles['timeline-hours']}>
      {_.range(0, hourSpan + hourStep, hourStep).map((i, n) => (
        <div
          className={styles['timeline-hour']}
          key={`timeline-label-${i}`}
          style={{left: `${(i / hourSpan) * 100}%`}}
        >
          <span>{moment({hours: hourSeries[n]}).format('LT')}</span>
        </div>
      ))}
    </div>
  );
}

function renderBusyColumns(availability, minHour, maxHour) {
  return (
    <>
      {availability.map(participant => {
        return participant.busySlots.map(slot => renderBusyColumn(slot, minHour, maxHour));
      })}
    </>
  );
}

function renderBusyColumn({startTime, endTime}, minHour, maxHour) {
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
  const segmentWidth = calculateWidth(start, end, minHour, maxHour);
  const segmentPosition = calculatePosition(start, minHour, maxHour);
  return (
    <>
      <div
        className={styles['busy-column']}
        style={{left: `${segmentPosition}%`, width: `${segmentWidth}%`}}
      ></div>
    </>
  );
}

export default function Timeline({date, availability, minHour, maxHour, hourStep}) {
  const hourSeries = _.range(minHour, maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;

  return (
    <div className={styles['timeline']}>
      <Header as="h2" className={styles['timeline-date']}>
        {date.format('D MMM YYYY')}
      </Header>
      {renderHeader(hourSeries, hourSpan, hourStep)}
      {renderRows(availability, minHour, maxHour)}
    </div>
  );
}

Timeline.propTypes = {
  date: PropTypes.object.isRequired,
  availability: PropTypes.array.isRequired,
  minHour: PropTypes.number,
  maxHour: PropTypes.number,
  hourStep: PropTypes.number,
};

Timeline.defaultProps = {
  date: null,
  minHour: 8,
  maxHour: 20,
  hourStep: 2,
};
