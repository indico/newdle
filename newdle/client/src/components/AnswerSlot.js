import PropTypes from 'prop-types';
import React from 'react';
import AnswerOption from './AnswerOption';
import styles from './Answer.module.scss';

export default function AnswerSlot({startTime, endTime, height, pos, width = 100, left = 0}) {
  return (
    <div
      className={styles['answer']}
      style={{top: `${pos}%`, height: `${height}%`, width: `${width - 2}%`, left: `${left}%`}}
    >
      <AnswerOption startTime={startTime} endTime={endTime} />
    </div>
  );
}

AnswerSlot.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
};
