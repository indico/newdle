import PropTypes from 'prop-types';
import React from 'react';
import Option from './Option';
import styles from './answer.module.scss';
import {useDispatch} from 'react-redux';

export default function Slot({option, width, left}) {
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
      <Option {...option} />
    </div>
  );
}

Slot.propTypes = {
  option: PropTypes.object.isRequired,
  width: PropTypes.number,
  left: PropTypes.number,
};

Slot.defaultProps = {
  width: 100,
  left: 0,
};
