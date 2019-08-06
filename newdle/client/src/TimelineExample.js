import React from 'react';
import Timeline from './components/Timeline';
import moment from 'moment';

export default function TimelineExample({participants}) {
  const availability = generateParticipantAvailability(participants);
  return <Timeline date="2019-07-29" availability={availability} />;
}

function generateParticipantAvailability(participants) {
  return participants.map(participant => {
    const start = randomNumber(5, 22);
    const end = randomNumber(start + 1, 24);
    const busySlots = [
      {
        startTime: moment(start, 'k').format('k:mm'),
        endTime: moment(end, 'k').format('k:mm'),
      },
    ];
    return {participant, busySlots};
  });
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
