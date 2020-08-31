import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';
import styles from './answer.module.scss';

export default function Option({
  icon,
  onClick,
  className,
  styles: moreStyles,
  startTimeLocal,
  endTimeLocal,
}) {
  return (
    <div className={`${styles.option} ${className}`} onClick={onClick} style={moreStyles}>
      <span className={styles.times}>
        {startTimeLocal} - {endTimeLocal}
      </span>
      <Icon name={icon} />
    </div>
  );
}

Option.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  styles: PropTypes.object,
  startTimeLocal: PropTypes.string.isRequired,
  endTimeLocal: PropTypes.string.isRequired,
};

Option.defaultProps = {
  onClick: null,
  styles: {},
};
