import PropTypes from 'prop-types';
import React from 'react';
import {useDispatch} from 'react-redux';
import Option from './Option';
import styles from './answer.module.scss';

export default function MultipleSlot({height, pos, options}) {
  const dispatch = useDispatch();
  return (
    <div className={styles['multiple-answer-slot']} style={{top: `${pos}%`, height: `${height}%`}}>
      {options.map(option => (
        <Option
          {...option}
          styles={{height: `${height / options.length}%`}}
          key={option.slot}
          onClick={() => dispatch(option.action())}
        />
      ))}
    </div>
  );
}

MultipleSlot.propTypes = {
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      slot: PropTypes.string.isRequired,
      action: PropTypes.func.isRequired,
    })
  ).isRequired,
};
