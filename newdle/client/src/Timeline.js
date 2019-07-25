import React from 'react';
import Participant from './Participant';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Header} from 'semantic-ui-react';
import styles from './Timeline.module.scss';
import moment from 'moment';

export default function Timeline({date, availability, minHour, maxHour, hourStep}) {
  const hourSeries = _.range(minHour, maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;
  const timelineLabels = (
    <div className={styles['timeline-labels']}>
      {_.range(0, hourSpan + hourStep, hourStep).map((i, n) => (
        <div
          className={styles['timeline-label']}
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
      <Header as="h3" className={styles['timeline-date']}>
        {date.format('D MMM YYYY')}
      </Header>
      {timelineLabels}
    </div>
  );
}

Timeline.propTypes = {
  date: PropTypes.object.isRequired,
  availability: PropTypes.object.isRequired,
  minHour: PropTypes.number,
  maxHour: PropTypes.number,
  hourStep: PropTypes.number,
};

Timeline.defaultProps = {
  date: null,
  availability: {},
  minHour: 8,
  maxHour: 20,
  hourStep: 2,
};
