import React from 'react';
import PropTypes from 'prop-types';
import {Header} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../../util/date';
import Slot from './Slot';
import AnswerMultipleSlot from './MultipleSlot';
import Option from './Option';
import {useDispatch} from 'react-redux';
import styles from './answer.module.scss';

export default function DayTimeline({options, busySlots}) {
  const dispatch = useDispatch();
  const date = serializeDate(toMoment(options.date, 'YYYY-MM-DD'), 'dddd D MMM');
  return (
    <>
      <Header as="h3" className={styles.date}>
        {date}
      </Header>
      <div className={styles['options-column']}>
        {options.optionGroups.map(group => {
          const size = group.length;
          if (size < 4) {
            const width = 100 / size;
            return group.map((option, index) => (
              <Slot
                {...option}
                width={width}
                left={width * index}
                key={option.slot}
                className={`${styles['answer-slot']} ${styles[option.answer]}`}
                content={<Option {...option} />}
                onClick={() => dispatch(option.action())}
                overlapping={size !== 1}
              />
            ));
          } else {
            const height = group[size - 1].pos - group[0].pos + group[size - 1].height;
            const pos = group[0].pos;
            const key = group[0].slot;
            return <AnswerMultipleSlot height={height} pos={pos} options={group} key={key} />;
          }
        })}
        {busySlots &&
          busySlots.times.map(time => (
            <Slot {...time} key={time.key} className={styles['busy-slot']} />
          ))}
      </div>
    </>
  );
}

DayTimeline.propTypes = {
  options: PropTypes.object.isRequired,
  busySlots: PropTypes.object.isRequired,
};
