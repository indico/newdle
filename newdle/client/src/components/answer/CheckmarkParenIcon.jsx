import React from 'react';
import PropTypes from 'prop-types';

const SIZE_MAP = {
  mini: 10,
  tiny: 12,
  small: 14,
  medium: 18,
  large: 24,
  big: 30,
  huge: 40,
  massive: 52,
};

export default function CheckmarkParenIcon({
  size = 'medium',
  color = 'currentColor',
  style = {},
  className = '',
  ...rest
}) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size] ?? SIZE_MAP.medium;

  const sw = 15; // stroke width

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-5 0 170 120"
      width={px + 2}
      height={px}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`checkmark-paren-icon${className ? ' ' + className : ''}`}
      aria-hidden="true"
      style={{display: 'inline-block', verticalAlign: 'middle', ...style}}
      {...rest}
    >
      {/* Left parenthesis */}
      <path d="M 40 10 C 8 30, 8 90, 40 110" strokeWidth={sw} />

      {/* Right parenthesis */}
      <path d="M 120 10 C 152 30, 152 90, 120 110" strokeWidth={sw} />

      {/* Checkmark */}
      <path d="M 44 62 L 68 84 L 116 38" strokeWidth={sw + 1} />
    </svg>
  );
}

CheckmarkParenIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
};

CheckmarkParenIcon.defaultProps = {
  size: 'medium',
  color: 'currentColor',
  style: {},
  className: '',
};
