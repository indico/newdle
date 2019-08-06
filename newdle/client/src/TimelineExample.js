import React from 'react';
import Timeline from './components/Timeline';
import moment from 'moment';

export default function TimelineExample({participants}) {
  const availability = generateParticipantAvailability(participants);
  return <Timeline date="2019-07-29" availability={availability} />;
}

function generateParticipantAvailability(participants) {
  let availability = [];
  participants.forEach(participant => {
    const start = randomNumber(6, 22);
    const end = randomNumber(start, 23);
    const busySlots = [
      {
        startTime: moment(start, 'k').format('k:mm'),
        endTime: moment(end, 'k').format('k:mm'),
      },
    ];
    availability.push({participant, busySlots});
  });
  return availability;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
