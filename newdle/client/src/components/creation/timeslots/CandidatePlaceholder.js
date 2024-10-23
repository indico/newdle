import React from 'react';
import PropTypes from 'prop-types';
/**
 * Displays a placeholder for a candidate time slot when the Timeline is hovered.
 */
export default function CandidatePlaceholder({xPosition, yPosition, height, widthPercent}) {
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '3px',
        color: 'white',
        display: 'block',
        height: height,
        left: xPosition,
        padding: '4px',
        position: 'fixed',
        pointerEvents: 'none',
        top: yPosition,
        transform: 'translate(-50%, -100%)',
        width: `${widthPercent}%`,
        zIndex: 1000,
      }}
    />
  );
}

CandidatePlaceholder.propTypes = {
  height: PropTypes.number.isRequired,
  widthPercent: PropTypes.number.isRequired,
  xPosition: PropTypes.number.isRequired,
  yPosition: PropTypes.number.isRequired,
};
