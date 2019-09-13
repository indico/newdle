import React from 'react';
import Answer from './Answer';

export default function AnswerExample() {
  const options = [
    {
      date: '2019-09-16',
      busySlots: [
        {
          startTime: '8:00',
          endTime: '10:00',
        },
      ],
      candidates: [
        {
          startTime: '12:00',
          endTime: '14:00',
        },
        {
          startTime: '15:00',
          endTime: '17:00',
        },
      ],
    },
    {
      date: '2019-09-18',
      busySlots: [],
      candidates: [
        {
          startTime: '15:00',
          endTime: '17:00',
        },
      ],
    },
    {
      date: '2019-09-24',
      busySlots: [
        {
          startTime: '9:00',
          endTime: '10:00',
        },
        {
          startTime: '13:00',
          endTime: '18:00',
        },
      ],
      candidates: [
        {
          startTime: '15:00',
          endTime: '17:00',
        },
      ],
    },
  ];

  return <Answer options={options} />;
}
