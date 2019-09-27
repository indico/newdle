import React, {useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getTimezone} from '../selectors';
import {setTimezone} from '../actions';
import {commonTimezones} from '../util/timezones';
import LazyDropdown from './LazyDropdown';
import styles from './TimezonePicker.module.scss';

export default React.memo(function TimezonePicker() {
  const dispatch = useDispatch();
  const timezone = useSelector(getTimezone);
  const options = useMemo(
    () =>
      commonTimezones.map(({name, caption}) => ({
        key: name,
        value: name,
        text: name,
        description: caption,
      })),
    []
  );
  return (
    <div>
      <span>Timezone</span>
      <LazyDropdown
        className={styles.dropdown}
        options={options}
        search
        selection
        selectOnBlur={false}
        selectOnNavigation={false}
        value={timezone}
        onChange={(_, {value}) => {
          dispatch(setTimezone(value));
        }}
      />
    </div>
  );
});
