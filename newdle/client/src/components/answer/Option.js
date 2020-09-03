import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';
import styles from './answer.module.scss';

export default function Option({icon, onClick, className, styles: moreStyles, startTime, endTime}) {
  return (
    <div className={`${styles.option} ${className}`} onClick={onClick} style={moreStyles}>
      <span className={styles.times}>
        {startTime} - {endTime}
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
};

Option.defaultProps = {
  onClick: null,
  styles: {},
};
