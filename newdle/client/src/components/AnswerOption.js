import {Icon} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../util/date';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './Answer.module.scss';

export default function AnswerOption({startTime, endTime, icon, onClick, style}) {
  const start = serializeDate(toMoment(startTime, 'H:mm'), 'H:mm');
  const end = serializeDate(toMoment(endTime, 'H:mm'), 'H:mm');
  return (
    <div className={`${styles['option']} ${style}`} onClick={onClick}>
      <span className={styles['times']}>
        {start} - {end}
      </span>
      <Icon name={icon} size="large" />
    </div>
  );
}

AnswerOption.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  style: PropTypes.string,
  icon: PropTypes.string.isRequired,
};

AnswerOption.defaultProps = {
  onClick: null,
  moreStyles: '',
};
