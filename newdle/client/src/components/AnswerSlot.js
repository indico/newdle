import PropTypes from 'prop-types';
import React from 'react';
import AnswerOption from './AnswerOption';
import styles from './Answer.module.scss';

export default function AnswerSlot({option, width, left}) {
  return (
    <div
      className={styles['answer']}
      style={{
        top: `${option.pos}%`,
        height: `${option.height}%`,
        width: `${width - 2}%`,
        left: `${left}%`,
      }}
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
