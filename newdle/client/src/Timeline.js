import React from 'react';
import Participant from './Participant';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Header} from 'semantic-ui-react';
import styles from './Timeline.module.scss';
import moment from 'moment';

function renderParticipant(participant) {
  return (
    <span className={styles['timeline-row-label']}>
      {<Participant name={`${participant.firstName} ${participant.lastName}`} />}
    </span>
  );
}

function renderSlots(busySlots) {}

function renderRow({participant, busySlots}) {
  return <div className={styles['timeline-row']}>{renderParticipant(participant)}</div>;
}

function renderRows(availability) {
  return <div>{availability.map(renderRow)}</div>;
}

export default function Timeline({date, availability, minHour, maxHour, hourStep}) {
  const hourSeries = _.range(minHour, maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;

  const timelineHeader = (
    <div className={styles['timeline-hours']}>
      {_.range(0, hourSpan + hourStep, hourStep).map((i, n) => (
        <div
          className={styles['timeline-hour']}
          key={`timeline-label-${i}`}
          style={{position: 'absolute', left: `${(i / hourSpan) * 100}%`}}
        >
          <span>{moment({hours: hourSeries[n]}).format('LT')}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles['timeline']}>
      <Header as="h2" className={styles['timeline-date']}>
        {date.format('D MMM YYYY')}
      </Header>
      {timelineHeader}
      {renderRows(availability)}
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
