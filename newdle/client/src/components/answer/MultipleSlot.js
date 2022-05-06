import React from 'react';
import PropTypes from 'prop-types';
import Option from './Option';
import styles from './answer.module.scss';

export default function MultipleSlot({height, pos, options, availableTimeslots}) {
  return (
    <div className={styles['multiple-answer-slot']} style={{top: `${pos}%`, height: `${height}%`}}>
      {options.map(option => {
        const taken = !availableTimeslots.includes(option.slot);
        const className = taken ? styles.taken : `${option.className} ${styles.selectable}`;
        return (
          <Option
            {...option}
            className={className}
            styles={{height: `${height / options.length}%`}}
            key={option.slot}
            slot={option.slot}
            taken={taken}
          />
        );
      })}
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
  availableTimeslots: PropTypes.array.isRequired,
};
