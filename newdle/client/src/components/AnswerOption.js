import {Checkbox} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../util/date';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './Answer.module.scss';

export default function AnswerOption({startTime, endTime}) {
  const start = serializeDate(toMoment(startTime, 'H:mm'), 'H:mm');
  const end = serializeDate(toMoment(endTime, 'H:mm'), 'H:mm');
  return (
    <div className={styles['option']}>
      <div className={styles['times']}>
        {start} - {end}
      </div>
      <Checkbox />
    </div>
  );
}

AnswerOption.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
};
