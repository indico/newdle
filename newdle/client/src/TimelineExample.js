import React from 'react';
import Timeline from './components/Timeline';

export default function TimelineExample() {
  const availability = [
    {
      participant: {
        id: 1,
        name: 'First Person',
        initials: 'F P',
        email: 'f.person@mail.com',
      },
      busySlots: [
        {
          startTime: '5:00',
          endTime: '9:00',
        },
        {
          startTime: '16:30',
          endTime: '22:00',
        },
      ],
    },
    {
      participant: {
        id: 2,
        name: 'Second Person',
        initials: 'S P',
        email: 's.person@mail.com',
      },
      busySlots: [
        {
          startTime: '14:00',
          endTime: '15:00',
        },
        {
          startTime: '15:30',
          endTime: '19:00',
        },
      ],
    },
    {
      participant: {
        id: 3,
        name: 'Third Person',
        initials: 'T P',
        email: 't.person@mail.com',
      },
      busySlots: [
        {
          startTime: '21:00',
          endTime: '23:30',
        },
      ],
    },
  ];

  return <Timeline date="2019-07-29" availability={availability} />;
}
