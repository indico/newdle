import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {Header} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../../util/date';
import Slot from './Slot';
import AnswerMultipleSlot from './MultipleSlot';
import styles from './answer.module.scss';

export default function DayTimeline({options}) {
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
                option={option}
                width={width}
                left={width * index}
                key={option.slot}
                overlapping={size !== 1}
              />
            ));
          } else {
            const height = _.sum(group.map(el => el.height));
            const pos = group[0].pos;
            const key = group[0].slot;
            return <AnswerMultipleSlot height={height} pos={pos} options={group} key={key} />;
          }
        })}
      </div>
    </>
  );
}

DayTimeline.propTypes = {
  options: PropTypes.object.isRequired,
};
