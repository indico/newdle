import PropTypes from 'prop-types';
import React from 'react';
import AnswerOption from './AnswerOption';
import styles from './Answer.module.scss';
import {useDispatch} from 'react-redux';

export default function AnswerSlot({option, width, left}) {
  const dispatch = useDispatch();
  return (
    <div
      className={`${styles['answer-slot']} ${styles[option.answer]}`}
      style={{
        top: `${option.pos}%`,
        height: `${option.height}%`,
        width: `${width - 2}%`,
        left: `${left}%`,
      }}
      onClick={() => dispatch(option.action())}
    >
      <AnswerOption {...option} />
    </div>
  );
}

AnswerSlot.propTypes = {
  option: PropTypes.object.isRequired,
  width: PropTypes.number,
  left: PropTypes.number,
};

AnswerSlot.defaultProps = {
  width: 100,
  left: 0,
};
