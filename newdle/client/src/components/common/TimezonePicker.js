import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {commonTimezones} from '../../util/timezones';
import LazyDropdown from '../LazyDropdown';
import styles from './TimezonePicker.module.scss';

function TimezonePicker({onChange, currentTz, title, ...props}) {
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
      {title}
      <LazyDropdown
        {...props}
        className={styles.dropdown}
        options={options}
        search
        selectOnBlur={false}
        selectOnNavigation={false}
        value={currentTz}
        onChange={(_, {value}) => {
          onChange(value);
        }}
      />
    </div>
  );
}

TimezonePicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  currentTz: PropTypes.string.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  inline: PropTypes.bool,
};

TimezonePicker.defaultProps = {
  title: null,
  inline: false,
};

export default React.memo(TimezonePicker);
