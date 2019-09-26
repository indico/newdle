import PropTypes from 'prop-types';
import React from 'react';
import AnswerOption from './AnswerOption';
import styles from './Answer.module.scss';

export default function MultipleAnswerSlot({height, pos, options}) {
  return (
    <div className={styles['answer']} style={{top: `${pos}%`, height: `${height}%`}}>
      {options.map(option => (
        <AnswerOption {...option} />
      ))}
    </div>
  );
}

MultipleAnswerSlot.propTypes = {
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  options: PropTypes.array.isRequired,
};
