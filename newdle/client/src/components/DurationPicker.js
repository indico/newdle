import React, {useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Dropdown} from 'semantic-ui-react';
import styles from './DurationPicker.module.scss';

function getDurationOptions(min, max, interval) {
  return _.range(min, max + interval, interval).map(i => ({key: i, value: i, text: i}));
}

export default function DurationPicker({minDuration, maxDuration, interval}) {
  const [durationValue, setDurationValue] = useState(minDuration);
  const durationOptions = getDurationOptions(minDuration, maxDuration, interval);

  return (
    <div className={styles['duration-picker']}>
      <span>Meeting time: </span>
      <Dropdown
        className={styles['dropdown']}
        options={durationOptions}
        selection
        value={durationValue}
        onChange={(_, {value}) => setDurationValue(value)}
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
