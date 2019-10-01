import {Icon} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../../util/date';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './answer.module.scss';

export default function Option({startTime, endTime, icon, onClick, className}) {
  const start = serializeDate(toMoment(startTime, 'H:mm'), 'H:mm');
  const end = serializeDate(toMoment(endTime, 'H:mm'), 'H:mm');
  return (
    <div className={`${styles.option} ${className}`} onClick={onClick}>
      <span className={styles.times}>
        {start} - {end}
      </span>
      <Icon name={icon} size="large" />
    </div>
  );
}

Option.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
};

Option.defaultProps = {
  onClick: null,
  moreStyles: '',
};
