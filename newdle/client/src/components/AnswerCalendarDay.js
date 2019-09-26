import {Header} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import {serializeDate, toMoment} from '../util/date';
import AnswerSlot from './AnswerSlot';
import AnswerMultipleSlot from './AnswerMultipleSlot';
import styles from './Answer.module.scss';

export default function AnswerCalendarDay({timeSlots}) {
  const date = serializeDate(toMoment(timeSlots.date, 'YYYY-MM-DD'), 'dddd D MMM');
  return (
    <>
      <Header as="h3" className={styles['date']}>
        {date}
      </Header>
      <div className={styles['options-column']}>
        {timeSlots.slotGroups.map(group => {
          const size = group.length;
          if (size < 4) {
            const width = 100 / size;
            return group.map((timeSlot, index) => (
              <AnswerSlot {...timeSlot} width={width} left={width * index} />
            ));
          } else {
            const height = group[size - 1].pos - group[0].pos + group[size - 1].height;
            const pos = group[0].pos;
            return <AnswerMultipleSlot height={height} pos={pos} options={group} />;
          }
        })}
      </div>
    </>
  );
}

AnswerCalendarDay.propTypes = {
  timeSlots: PropTypes.object.isRequired,
};
