import PropTypes from 'prop-types';
import React from 'react';
import {useDispatch} from 'react-redux';
import AnswerOption from './AnswerOption';
import styles from './Answer.module.scss';

export default function MultipleAnswerSlot({height, pos, options}) {
  const dispatch = useDispatch();
  return (
    <div className={styles['multiple-answer-slot']} style={{top: `${pos}%`, height: `${height}%`}}>
      {options.map(option => {
        return (
          <AnswerOption {...option} key={option.slot} onClick={() => dispatch(option.action)} />
        );
      })}
    </div>
  );
}

MultipleAnswerSlot.propTypes = {
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  options: PropTypes.array.isRequired,
};
