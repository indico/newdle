import React from 'react';
import PropTypes from 'prop-types';

export default function AvailabilityRing({
  available,
  ifNeeded,
  totalParticipants,
  strokeWidth,
  radius,
}) {
  const size = radius * 1.1;
  const normalizedRadius = radius - 14;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    <div>
      <svg height={size * 2} width={size * 2}>
        <circle
          stroke="#00ac46"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={
            circumference * (available / totalParticipants) +
            ' ' +
            circumference * ((totalParticipants - available) / totalParticipants)
          }
          transform={`rotate(-90 ${size} ${size})`}
          r={normalizedRadius}
          cx={size}
          cy={size}
        />
        <circle
          stroke="#fdc500"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference * (ifNeeded / totalParticipants) + ' ' + circumference}
          transform={`rotate(${-90 + (available / totalParticipants) * 360} ${size} ${size})`}
          r={normalizedRadius}
          cx={size}
          cy={size}
        />
        <circle
          stroke="#dc0000"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={
            circumference * ((totalParticipants - (available + ifNeeded)) / totalParticipants) +
            ' ' +
            circumference
          }
          transform={`rotate(${-90 +
            ((available + ifNeeded) / totalParticipants) * 360} ${size} ${size})`}
          r={normalizedRadius}
          cx={size}
          cy={size}
        />
        <text x="50%" y="50%" textAnchor="middle" stroke="#000" strokeWidth=".3px" dy=".3em">
          {`${available + ifNeeded}/${totalParticipants}`}
        </text>
      </svg>
    </div>
  );
}

AvailabilityRing.propTypes = {
  available: PropTypes.number.isRequired,
  ifNeeded: PropTypes.number.isRequired,
  totalParticipants: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number,
  radius: PropTypes.number,
};

AvailabilityRing.defaultProps = {
  strokeWidth: 10,
  radius: 50,
};
