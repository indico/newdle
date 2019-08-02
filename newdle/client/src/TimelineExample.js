import React from 'react';
import Timeline from './components/Timeline';

export default function TimelineExample() {
  const availability = [
    {
      participant: {
        id: 1,
        lastName: 'Person',
        firstName: 'First',
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
        lastName: 'Person',
        firstName: 'Second',
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
        lastName: 'Person',
        firstName: 'Third',
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
