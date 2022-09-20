import React from 'react';
import PropTypes from 'prop-types';
import {Popup} from 'semantic-ui-react';
import styles from './Timeline.module.scss';

export default function Slot({width, pos, moreStyles, onClick, children, tooltip}) {
  return (
    <div
      className={`${styles['slot']} ${moreStyles}`}
      style={{left: `${pos}%`, width: `${width}%`}}
    >
      <Popup
        position="top center"
        mouseEnterDelay={100}
        trigger={<div onClick={onClick} style={{height: '100%', width: `100%`}} />}
        content={tooltip}
        disabled={!tooltip}
      />
      {children}
    </div>
  );
}

Slot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  moreStyles: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

Slot.defaultProps = {
  moreStyles: '',
  onClick: null,
  children: null,
  tooltip: null,
};
