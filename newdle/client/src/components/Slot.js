import React from 'react';
import PropTypes from 'prop-types';
import styles from './Timeline.module.scss';

export default function Slot({width, pos, moreStyles, onClick, children}) {
  return (
    <div
      onClick={onClick}
      className={`${styles['slot']} ${moreStyles}`}
      style={{left: `${pos}%`, width: `${width}%`}}
    >
      {children}
    </div>
  );
}

Slot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  moreStyles: PropTypes.string,
};

Slot.defaultProps = {
  moreStyles: '',
};
