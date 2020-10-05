import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import styles from './Timeline.module.scss';

export default function TimelineHeader({hourSeries, hourSpan, hourStep}) {
  return (
    <div className={styles['timeline-hours']}>
      {_.range(0, hourSpan + hourStep, hourStep).map((i, n) => (
        <div
          className={styles['timeline-hour']}
          key={`timeline-label-${i}`}
          style={{left: `${(i / hourSpan) * 100}%`}}
        >
          <span className={styles['timeline-hour-text']}>
            {n === 0 && hourSeries[n] === 0 ? '0' : moment({hours: hourSeries[n]}).format('k')}
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
