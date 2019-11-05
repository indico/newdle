import React from 'react';
import PropTypes from 'prop-types';

export default function AvailabilityRing({
  available,
  ifNeeded,
  unavailable,
  totalParticipants,
  strokeWidth,
  radius,
}) {
  const size = radius * 1.1;
  const normalizedRadius = radius - 14;
  const circumference = normalizedRadius * 2 * Math.PI;

  const availableRatio = available / totalParticipants;
  const ifNeededRatio = ifNeeded / totalParticipants;
  const ifNeededRotation = available / totalParticipants;
  const unavailableRatio = unavailable / totalParticipants;
  const unavailableRotation = (available + ifNeeded) / totalParticipants;

  // not answered is always visible, so we need to avoid div-by-zero causing NaN
  const notAnsweredRatio = totalParticipants
    ? (totalParticipants - (available + ifNeeded + unavailable)) / totalParticipants
    : 1;
  const notAnsweredRotation = totalParticipants
    ? (available + ifNeeded + unavailable) / totalParticipants
    : 0;

  return (
    <div>
      <svg height={size * 2} width={size * 2}>
        {available !== 0 && (
          <circle
            stroke="#00ac46"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * availableRatio} ${circumference}`}
            transform={`rotate(-90 ${size} ${size})`}
            r={normalizedRadius}
            cx={size}
            cy={size}
          />
        )}
        {ifNeeded !== 0 && (
          <circle
            stroke="#fdc500"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * ifNeededRatio} ${circumference}`}
            transform={`rotate(${-90 + ifNeededRotation * 360} ${size} ${size})`}
            r={normalizedRadius}
            cx={size}
            cy={size}
          />
        )}
        {unavailable !== 0 && (
          <circle
            stroke="#dc0000"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * unavailableRatio} ${circumference}`}
            transform={`rotate(${-90 + unavailableRotation * 360} ${size} ${size})`}
            r={normalizedRadius}
            cx={size}
            cy={size}
          />
        )}
        <circle
          stroke="#cccccc"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * notAnsweredRatio} ${circumference}`}
          transform={`rotate(${-90 + notAnsweredRotation * 360} ${size} ${size})`}
          r={normalizedRadius}
          cx={size}
          cy={size}
        />
        {totalParticipants !== 0 && (
          <text x="50%" y="50%" textAnchor="middle" stroke="#000" strokeWidth=".3px" dy=".3em">
            {`${available + ifNeeded}/${totalParticipants}`}
          </text>
        )}
      </svg>
    </div>
  );
}

AvailabilityRing.propTypes = {
  available: PropTypes.number.isRequired,
  ifNeeded: PropTypes.number.isRequired,
  unavailable: PropTypes.number.isRequired,
  totalParticipants: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number,
  radius: PropTypes.number,
};

AvailabilityRing.defaultProps = {
  strokeWidth: 10,
  radius: 50,
};
