import React from 'react';
import PropTypes from 'prop-types';
import {Popup} from 'semantic-ui-react';
/**
 * Displays a placeholder for a candidate time slot when the Timeline is hovered.
 */
export default function CandidatePlaceholder({visible, left, width, time, height}) {
  if (!visible) {
    return null;
  }

  return (
    <Popup
      content={time}
      open={true}
      position="top center"
      trigger={
        <div
          style={{
            boxSizing: 'border-box',
            position: 'absolute',
            left: `${left}%`,
            width: `${width}%`,
            height: `calc(${height}px - 10px)`,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      }
    />
  );
}

CandidatePlaceholder.propTypes = {
  visible: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  time: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
};
