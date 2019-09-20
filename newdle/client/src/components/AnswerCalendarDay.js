import {Checkbox, Header} from 'semantic-ui-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './Answer.module.scss';

function CandidateOption({startTime, endTime}) {
  return (
    <div className={styles['option']}>
      <div className={styles['times']}>
        {moment(startTime, 'H:mm').format('H:mm')} - {moment(endTime, 'H:mm').format('H:mm')}
      </div>
      <Checkbox />
    </div>
  );
}

CandidateOption.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
};

function CandidateSlot({startTime, endTime, height, pos, width = 100, left = 0}) {
  return (
    <div
      className={styles['candidate']}
      style={{top: `${pos}%`, height: `${height}%`, width: `${width - 2}%`, left: `${left}%`}}
    >
      <CandidateOption startTime={startTime} endTime={endTime} />
    </div>
  );
}

CandidateSlot.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
};

function MultipleCandidateSlot({height, pos, options}) {
  return (
    <div className={styles['candidate']} style={{top: `${pos}%`, height: `${height}%`}}>
      {options.map(option => (
        <CandidateOption {...option} />
      ))}
    </div>
  );
}

MultipleCandidateSlot.propTypes = {
  height: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  options: PropTypes.array.isRequired,
};

function TimeSlotGroup({timeSlotGroup}) {
  const size = timeSlotGroup.length;
  if (size < 4) {
    const width = 100 / size;
    return timeSlotGroup.map((timeSlot, index) => (
      <CandidateSlot {...timeSlot} width={width} left={width * index} />
    ));
  } else {
    const height =
      timeSlotGroup[size - 1].pos - timeSlotGroup[0].pos + timeSlotGroup[size - 1].height;
    const pos = timeSlotGroup[0].pos;
    return <MultipleCandidateSlot height={height} pos={pos} options={timeSlotGroup} />;
  }
}

TimeSlotGroup.propTypes = {
  timeSlotGroup: PropTypes.array.isRequired,
};

export default function AnswerCalendarDay({timeSlots}) {
  const date = moment(timeSlots.date, 'YYYY-MM-DD').format('dddd D MMM');
  return (
    <>
      <Header as="h3" className={styles['date']}>
        {date}
      </Header>
      <div className={styles['options-column']}>
        {timeSlots.slotGroups.map(group => (
          <TimeSlotGroup timeSlotGroup={group} />
        ))}
      </div>
    </>
  );
}

AnswerCalendarDay.propTypes = {
  timeSlots: PropTypes.object.isRequired,
};
