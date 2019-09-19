import React, {useMemo} from 'react';
import {Dropdown} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {getTimezone} from '../selectors';
import {setTimezone} from '../actions';

import {commonTimezones} from '../util/timezones';
import styles from './TimezonePicker.module.scss';

export default function TimezonePicker() {
  const dispatch = useDispatch();
  const timezone = useSelector(getTimezone);
  const options = useMemo(
    () =>
      commonTimezones.map(({name, caption}) => {
        return {
          key: name,
          value: name,
          text: name,
          description: caption,
          active: name === timezone,
        };
      }),
    [timezone]
  );
  return (
    <div>
      <span>Timezone</span>
      <Dropdown
        className={styles['dropdown']}
        options={options}
        search
        selection
        selectOnBlur={false}
        value={timezone}
        onChange={(_, {value}) => {
          dispatch(setTimezone(value));
        }}
      />
    </div>
  );
}
