import _ from 'lodash';
import {Grid} from 'semantic-ui-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import {serializeDate, toMoment} from '../util/date';
import {useSelector} from 'react-redux';
import styles from './Answer.module.scss';
import AnswerCalendarDay from './AnswerCalendarDay';
import {getNewdleTimeslots, getNewdleDuration} from '../selectors';

const OVERFLOW_HEIGHT = 0.5;

function calculateHeight(start, end, minHour, maxHour) {
  let startMins = start.hours() * 60 + start.minutes();
  let endMins = end.hours() * 60 + end.minutes();

  if (startMins < minHour * 60) {
    startMins = minHour * 60;
  }
  if (endMins > maxHour * 60) {
    endMins = maxHour * 60;
  }
  const height = ((endMins - startMins) / ((maxHour - minHour) * 60)) * 100;
  return height > 0 ? height : OVERFLOW_HEIGHT;
}

function calculatePosition(start, minHour, maxHour) {
  const spanMins = (maxHour - minHour) * 60;
  let startMins = start.hours() * 60 + start.minutes() - minHour * 60;

  if (startMins < 0) {
    startMins = 0;
  }

  const position = (startMins / spanMins) * 100;
  return position < 100 ? position : 100 - OVERFLOW_HEIGHT;
}

function groupOverlaps(timeSlots) {
  const sortedTimeSlots = _.orderBy(timeSlots, ['pos'], ['asc']);
  // marks items that overlap with its successors
  let cluster_id = 0;
  const clusteredCandidates = sortedTimeSlots.map((candidate, index, sortedTimeSlots) => {
    if (
      sortedTimeSlots[index - 1] &&
      moment(candidate.startTime, 'HH:mm').isSameOrAfter(
        moment(sortedTimeSlots[index - 1].endTime, 'HH:mm')
      )
    ) {
      cluster_id += 1;
    }
    return {...candidate, cluster_id: cluster_id};
  });

  return _.chain(clusteredCandidates)
    .groupBy(cand => {
      return cand.cluster_id;
    })
    .values()
    .value();
}

function getSlotProps(slot, duration, minHour, maxHour) {
  const start = toMoment(slot, 'YYYY-MM-DDTHH:mm');
  const end = moment(start).add(duration, 'm');

  return {
    slot,
    startTime: serializeDate(start, 'HH:mm'),
    endTime: serializeDate(end, 'HH:mm'),
    height: calculateHeight(start, end, minHour, maxHour),
    pos: calculatePosition(start, minHour, maxHour),
    key: `${slot}`,
  };
}

function getDate(timeslot) {
  return serializeDate(toMoment(timeslot, 'YYYY-MM-DDTHH:mm'), 'YYYY-MM-DD');
}

function calculateSlotsPositions(slots, duration, minHour, maxHour) {
  const slotsByDate = _.chain(slots)
    .map(slot => getSlotProps(slot, duration, minHour, maxHour))
    .groupBy(slot => getDate(slot.slot))
    .value();

  return Object.entries(slotsByDate).map(([date, slots]) => {
    return {date: date, slotGroups: groupOverlaps(slots)};
  });
}

function Hours({minHour, maxHour, hourStep}) {
  const hourSeries = _.range(minHour, maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;

  return (
    <div className={styles['hours-column']}>
      {_.range(0, hourSpan + hourStep, hourStep).map((i, n) => (
        <div
          className={styles['hour']}
          key={`hour-label-${i}`}
          style={{top: `${(i / hourSpan) * 100}%`}}
        >
          {moment({hours: hourSeries[n]}).format('k')}
        </div>
      ))}
    </div>
  );
}

Hours.propTypes = {
  minHour: PropTypes.number.isRequired,
  maxHour: PropTypes.number.isRequired,
  hourStep: PropTypes.number,
};

Hours.defaultProps = {
  hourStep: 2,
};

export default function AnswerCalendar({minHour, maxHour}) {
  const timeSlots = useSelector(getNewdleTimeslots);
  const duration = useSelector(getNewdleDuration);
  const slotsByDay = calculateSlotsPositions(timeSlots, duration, minHour, maxHour);

  if (slotsByDay.length === 0) {
    return <div>No data</div>;
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={1}>
          <Hours minHour={minHour} maxHour={maxHour} />
        </Grid.Column>
        <Grid.Column width={5}>
          <AnswerCalendarDay timeSlots={slotsByDay[0]} />
        </Grid.Column>
        <Grid.Column width={5}>
          <AnswerCalendarDay timeSlots={slotsByDay[1]} />
        </Grid.Column>
        <Grid.Column width={5}>
          <AnswerCalendarDay timeSlots={slotsByDay[2]} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

AnswerCalendar.propTypes = {
  minHour: PropTypes.number,
  maxHour: PropTypes.number,
};

AnswerCalendar.defaultProps = {
  minHour: 8,
  maxHour: 20,
};
