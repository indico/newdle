import React from 'react';
import {useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';
import CheckmarkParenIcon from './CheckmarkParenIcon';
import styles from './answer.module.scss';

export default function Option({
  startTime,
  endTime,
  icon,
  action,
  className,
  label,
  taken,
  styles: moreStyles,
}) {
  const dispatch = useDispatch();

  let iconEl;
  if (taken) {
    iconEl = <Icon name="ban" />;
  } else if (icon === '~') {
    iconEl = <CheckmarkParenIcon className={`icon ${styles['icon-ifneedbe']}`} />;
  } else if (icon === 'check') {
    iconEl = <Icon name={icon} className={styles['icon-check']} />;
  } else {
    iconEl = <Icon name={icon} />;
  }

  return (
    <div
      className={`${styles.option} ${className}`}
      onClick={taken ? null : () => dispatch(action())}
      style={{...moreStyles, cursor: taken ? 'inherit' : 'pointer'}}
    >
      <span className={styles['time-info']}>
        {iconEl}
        <span className={styles.times}>
          {startTime} - {endTime}
        </span>
      </span>
      {label && !taken && <span className={styles.label}>{label}</span>}
    </div>
  );
}

Option.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  action: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string,
  styles: PropTypes.object,
  taken: PropTypes.bool.isRequired,
};

Option.defaultProps = {
  onClick: null,
  label: undefined,
  styles: {},
};
