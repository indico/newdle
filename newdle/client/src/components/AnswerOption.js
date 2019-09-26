import {Checkbox} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../util/date';
import PropTypes from 'prop-types';
import React from 'react';
import {useDispatch} from 'react-redux';
import styles from './Answer.module.scss';
import {addAnswer} from '../actions';

export default function AnswerOption({startTime, endTime, slot}) {
  const dispatch = useDispatch();
  const start = serializeDate(toMoment(startTime, 'H:mm'), 'H:mm');
  const end = serializeDate(toMoment(endTime, 'H:mm'), 'H:mm');
  return (
    <div className={styles['option']} onClick={() => dispatch(addAnswer(slot, 'available'))}>
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
  slot: PropTypes.string.isRequired,
};
