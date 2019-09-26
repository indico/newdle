import {Checkbox} from 'semantic-ui-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './Answer.module.scss';

export default function AnswerOption({startTime, endTime}) {
  return (
    <div className={styles['option']}>
      <div className={styles['times']}>
        {moment(startTime, 'H:mm').format('H:mm')} - {moment(endTime, 'H:mm').format('H:mm')}
      </div>
      <Checkbox />
    </div>
  );
}

AnswerOption.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
};
