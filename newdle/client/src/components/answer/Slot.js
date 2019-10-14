import React from 'react';
import PropTypes from 'prop-types';

export default function Slot({pos, height, width, left, className, onClick, content, overlapping}) {
  return (
    <div
      className={`${className} ${overlapping ? 'overlapping' : null}`}
      style={{
        top: `${pos}%`,
        height: `${height}%`,
        width: `${width}%`,
        left: `${left}%`,
      }}
      onClick={onClick}
    >
      {content}
    </div>
  );
}

Slot.propTypes = {
  pos: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number,
  left: PropTypes.number,
  overlapping: PropTypes.bool,
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  content: PropTypes.object,
};

Slot.defaultProps = {
  width: 100,
  left: 0,
  overlapping: false,
  onClick: null,
  content: null,
};
