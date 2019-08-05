import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Dropdown} from 'semantic-ui-react';
import {setDuration} from '../actions';
import {getDuration} from '../selectors';
import styles from './DurationPicker.module.scss';

function getDurationOptions(min, max, interval) {
  return _.range(min, max + interval, interval).map(i => ({key: i, value: i, text: i}));
}

export default function DurationPicker({minDuration, maxDuration, interval}) {
  const duration = useSelector(getDuration);
  const durationOptions = getDurationOptions(minDuration, maxDuration, interval);
  const dispatch = useDispatch();

  return (
    <div className={styles['duration-picker']}>
      <span>Meeting time: </span>
      <Dropdown
        className={styles['dropdown']}
        options={durationOptions}
        selection
        value={duration}
        onChange={(_, {value}) => dispatch(setDuration(value))}
      />
      <span> minutes</span>
    </div>
  );
}

DurationPicker.propTypes = {
  minDuration: PropTypes.number,
  maxDuration: PropTypes.number,
  interval: PropTypes.number,
};

DurationPicker.defaultProps = {
  minDuration: 15,
  maxDuration: 90,
  interval: 15,
};
