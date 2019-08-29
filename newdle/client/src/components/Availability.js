import React from 'react';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {getCalendarActiveDate} from '../selectors';
import {serializeDate} from '../util/date';
import Timeline from './Timeline';

export default function Availability({participants}) {
  const availability = generateParticipantAvailability(participants);
  const date = serializeDate(useSelector(getCalendarActiveDate));

  // explicit key to avoid keeping state between dates.
  // like this we automatically leave/enter edit mode based on whether
  // there are any timeline entries for the given da
  return <Timeline key={date} date={date} availability={availability} />;
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
