import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Trans, plural, t} from '@lingui/macro';
import _ from 'lodash';
import PropTypes from 'prop-types';
import TimePicker from 'rc-time-picker';
import {Dropdown} from 'semantic-ui-react';
import {setDuration} from '../../../actions';
import {getDuration} from '../../../selectors';
import {toMoment} from '../../../util/date';
import 'rc-time-picker/assets/index.css';
import styles from './DurationPicker.module.scss';

const MAX_DURATION_HOURS = 16;

function _minutesToHM(minutes) {
  const hours = Math.floor(minutes / 60);
  if (!hours) {
    return `${minutes} minutes`;
  }
  minutes = minutes % 60;
  if (!minutes) {
    return plural(hours, {one: `${hours} hour`, other: `${hours} hours`});
  }
  return t`${hours}h ${minutes}min`;
}

function getDurationOptions(min, max, interval) {
  return _.range(min, max + interval, interval).map(i => ({
    key: i,
    value: i,
    text: _minutesToHM(i),
  }));
}

export default function DurationPicker({minDuration, maxDuration, interval}) {
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);
  const duration = useSelector(getDuration);
  const durationOptions = getDurationOptions(minDuration, maxDuration, interval);
  if (!durationOptions.map(option => option.key).includes(duration)) {
    durationOptions.push({key: duration, value: duration, text: _minutesToHM(duration)});
  }
  durationOptions.push({key: 'custom', value: null, text: 'Custom'});
  const dispatch = useDispatch();

  const disabledHours = () => _.range(MAX_DURATION_HOURS + 1, 24, 1);
  const disabledMinutes = h => (h === 0 ? [0] : []);

  return (
    <div>
      <span>
        <Trans>Duration</Trans>
      </span>
      {showCustomDuration ? (
        <TimePicker
          className={styles['duration-picker']}
          popupClassName={styles['duration-input']}
          open={durationPickerOpen}
          onOpen={() => setDurationPickerOpen(true)}
          onClose={() => setDurationPickerOpen(false)}
          showSecond={false}
          value={toMoment('00:00', 'HH:mm').add(duration, 'm')}
          format="H[h] mm[min]"
          onChange={time => {
            if (time !== null) {
              const value = time.hours() * 60 + time.minutes();
              dispatch(setDuration(value));
            }
          }}
          allowEmpty={false}
          minuteStep={15}
          disabledHours={disabledHours}
          disabledMinutes={disabledMinutes}
          hideDisabledOptions
        />
      ) : (
        <Dropdown
          options={durationOptions}
          selection
          value={duration}
          onChange={(_, {value}) => {
            if (value !== null) {
              dispatch(setDuration(value));
            } else {
              setShowCustomDuration(true);
              setDurationPickerOpen(true);
            }
          }}
        />
      )}
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
