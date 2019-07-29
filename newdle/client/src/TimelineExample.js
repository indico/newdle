import React from 'react';
import Timeline from './Timeline';

export default function TimelineExample() {
  const availability = [
    {
      participant: {
        lastName: 'Person',
        firstName: 'First',
      },
      busySlots: [
        {
          startTime: '8:00',
          endTime: '10:00',
        },
        {
          startTime: '16:30',
          endTime: '22:00',
        },
      ],
    },
    {
      participant: {
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
        lastName: 'Person',
        firstName: 'Third',
      },
      busySlots: [
        {
          startTime: '17:00',
          endTime: '20:00',
        },
      ],
    },
  ];

  return <Timeline date="2019-07-29" availability={availability} />;
}
