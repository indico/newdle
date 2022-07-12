import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {Header} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../../util/date';
import {useNumDaysVisible} from '../../util/hooks';
import AnswerMultipleSlot from './MultipleSlot';
import Option from './Option';
import Slot from './Slot';
import styles from './answer.module.scss';

export default function DayTimeline({
  options,
  busySlots,
  availableTimeslots,
  selected,
  hourPositions,
}) {
  const numDaysVisible = useNumDaysVisible();
  // This date does not need to be timezone casted as we are only format correcting
  const formattedDate = serializeDate(toMoment(options.date, 'YYYY-MM-DD'), 'dddd D MMM');
  const selectedDayClass = classNames(styles.date, {
    [styles['date-selected']]: selected && numDaysVisible > 1,
  });
  return (
    <>
      <Header as="h3" className={selectedDayClass}>
        {formattedDate}
      </Header>
      <div className={styles['options-column']}>
        {hourPositions &&
          hourPositions.map(pos => (
            <hr key={pos} className={styles['hours-separator']} style={{top: `${pos}%`}} />
          ))}
        {options.optionGroups.map(group => {
          const size = group.length;
          if (size < 4) {
            const width = 100 / size;
            return group.map((option, index) => {
              const taken = !availableTimeslots.includes(option.slot);
              return (
                <Slot
                  {...option}
                  width={width}
                  left={width * index}
                  key={option.slot}
                  className={`${styles['answer-slot']} ${styles[option.answer]} ${
                    taken ? styles.taken : styles.selectable
                  }`}
                  content={<Option {...option} taken={taken} />}
                  overlapping={size !== 1}
                />
              );
            });
          } else {
            const height = group[size - 1].pos - group[0].pos + group[size - 1].height;
            const pos = group[0].pos;
            const key = group[0].slot;
            return (
              <AnswerMultipleSlot
                height={height}
                pos={pos}
                options={group}
                key={key}
                availableTimeslots={availableTimeslots}
              />
            );
          }
        })}
        {busySlots &&
          busySlots.times.map(time => (
            <Slot
              {...time}
              key={time.key}
              className={styles['busy-slot']}
              tooltip={`${time.startTime} - ${time.endTime}`}
            />
          ))}
      </div>
    </>
  );
}

DayTimeline.propTypes = {
  options: PropTypes.object.isRequired,
  busySlots: PropTypes.object,
  availableTimeslots: PropTypes.array.isRequired,
  selected: PropTypes.bool.isRequired,
  hourPositions: PropTypes.array,
};

DayTimeline.defaultProps = {
  busySlots: null,
};
