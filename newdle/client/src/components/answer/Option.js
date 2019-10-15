import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../../util/date';
import styles from './answer.module.scss';

export default function Option({startTime, endTime, icon, onClick, className, styles: moreStyles}) {
  const start = serializeDate(toMoment(startTime, 'H:mm'), 'H:mm');
  const end = serializeDate(toMoment(endTime, 'H:mm'), 'H:mm');

  return (
    <div className={`${styles.option} ${className}`} onClick={onClick} style={moreStyles}>
      <span className={styles.times}>
        {start} - {end}
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
