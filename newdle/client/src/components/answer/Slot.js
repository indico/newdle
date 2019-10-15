import React from 'react';
import PropTypes from 'prop-types';
import {useDispatch} from 'react-redux';
import Option from './Option';
import styles from './answer.module.scss';

export default function Slot({option, width, left, overlapping}) {
  const dispatch = useDispatch();
  return (
    <div
      className={`${styles['answer-slot']} ${styles[option.answer]} ${
        overlapping ? 'overlapping' : null
      }`}
      style={{
        top: `${option.pos}%`,
        height: `${option.height}%`,
        width: `${width}%`,
        left: `${left}%`,
      }}
      onClick={() => dispatch(option.action())}
    >
      <Option {...option} />
    </div>
  );
}

Slot.propTypes = {
  option: PropTypes.shape({
    slot: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
    pos: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    answer: PropTypes.string.isRequired,
  }).isRequired,
  width: PropTypes.number,
  left: PropTypes.number,
  overlapping: PropTypes.bool,
};

Slot.defaultProps = {
  width: 100,
  left: 0,
  overlapping: false,
};
