import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Dropdown} from 'semantic-ui-react';
import {setDuration} from '../../../actions';
import {getDuration} from '../../../selectors';

function _minutesToHM(minutes) {
  const hours = Math.floor(minutes / 60);
  if (!hours) {
    return `${minutes} minutes`;
  }
  minutes = minutes % 60;
  if (!minutes) {
    return hours === 1 ? `${hours} hour` : `${hours} hours`;
  }
  return `${hours}h ${minutes}min`;
}

function getDurationOptions(min, max, interval) {
  return _.range(min, max + interval, interval).map(i => ({
    key: i,
    value: i,
    text: _minutesToHM(i),
  }));
}

export default function DurationPicker({minDuration, maxDuration, interval}) {
  const duration = useSelector(getDuration);
  const durationOptions = getDurationOptions(minDuration, maxDuration, interval);
  const dispatch = useDispatch();

  return (
    <div>
      <span>Meeting time</span>
      <Dropdown
        options={durationOptions}
        selection
        value={duration}
        onChange={(_, {value}) => dispatch(setDuration(value))}
      />
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
