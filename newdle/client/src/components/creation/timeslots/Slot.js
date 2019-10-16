import React from 'react';
import PropTypes from 'prop-types';
import {Popup} from 'semantic-ui-react';
import styles from './Timeline.module.scss';

export default function Slot({width, pos, moreStyles, onClick, children, tooltip}) {
  return (
    <Popup
      position="top center"
      mouseEnterDelay={100}
      trigger={
        <div
          onClick={onClick}
          className={`${styles['slot']} ${moreStyles}`}
          style={{left: `${pos}%`, width: `${width}%`}}
        >
          {children}
        </div>
      }
      content={tooltip}
      disabled={!tooltip}
    />
  );
}

Slot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  moreStyles: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  tooltip: PropTypes.string,
};

Slot.defaultProps = {
  moreStyles: '',
  onClick: null,
  children: null,
  tooltip: null,
};
