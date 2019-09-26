import {Checkbox} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../util/date';
import PropTypes from 'prop-types';
import React from 'react';
import {useDispatch} from 'react-redux';
import {addAnswer} from '../actions';
import styles from './Answer.module.scss';

export default function AnswerOption({startTime, endTime, slot, available}) {
  const dispatch = useDispatch();
  const start = serializeDate(toMoment(startTime, 'H:mm'), 'H:mm');
  const end = serializeDate(toMoment(endTime, 'H:mm'), 'H:mm');

  return (
    <div className={styles['option']} onClick={() => dispatch(addAnswer(slot, 'available'))}>
      <div className={styles['times']}>
        {start} - {end}
      </div>
      <Checkbox checked={available} onClick={() => {}} />
    </div>
  );
}

AnswerOption.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  slot: PropTypes.string.isRequired,
  available: PropTypes.bool,
};

AnswerOption.deafultProps = {
  available: false,
};
