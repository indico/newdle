import _ from 'lodash';
import {Grid} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import {serializeDate, toMoment} from '../util/date';
import {useSelector} from 'react-redux';
import AnswerCalendarDay from './AnswerCalendarDay';
import {getNewdleTimeslots, getNewdleDuration, getAnswers} from '../selectors';
import {addAnswer, removeAnswer} from '../actions';
import styles from './Answer.module.scss';

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
  return height || OVERFLOW_HEIGHT;
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

function groupOverlaps(options) {
  // sort options
  const sortedOptions = _.orderBy(options, ['pos'], ['asc']);
  // mark items that overlap with their successors
  let clusterId = 0;
  const clusteredOptions = sortedOptions.map((option, index, sortedOptions) => {
    if (
      sortedOptions[index - 1] &&
      toMoment(option.startTime, 'HH:mm').isSameOrAfter(
        toMoment(sortedOptions[index - 1].endTime, 'HH:mm')
      )
    ) {
      clusterId += 1;
    }
    return {...option, clusterId};
  });
  // group overlapping options
  return Object.values(_.groupBy(clusteredOptions, c => c.clusterId));
}

function getAnswerProps(slot, answer) {
  if (answer === 'available') {
    return {
      icon: 'check square outline',
      action: addAnswer(slot, 'ifneedbe'),
      style: styles['available'],
    };
  } else if (answer === 'ifneedbe') {
    return {
      icon: 'minus square outline',
      action: removeAnswer(slot),
      style: styles['ifneedbe'],
    };
  } else {
    return {
      icon: 'square outline',
      action: addAnswer(slot, 'available'),
      style: styles['unavailable'],
    };
  }
}

function getSlotProps(slot, duration, minHour, maxHour, answer) {
  const start = toMoment(slot, moment.HTML5_FMT.DATETIME_LOCAL);
  const end = toMoment(start).add(duration, 'm');
  const answerProps = getAnswerProps(slot, answer);

  return {
    slot,
    startTime: serializeDate(start, 'HH:mm'),
    endTime: serializeDate(end, 'HH:mm'),
    height: calculateHeight(start, end, minHour, maxHour),
    pos: calculatePosition(start, minHour, maxHour),
    key: slot,
    answer: answer || 'unavailable',
    ...answerProps,
  };
}

function getDate(timeslot) {
  return serializeDate(toMoment(timeslot, moment.HTML5_FMT.DATETIME_LOCAL));
}

function calculateOptionsPositions(options, duration, minHour, maxHour, answers) {
  const optionsByDate = _.groupBy(
    options.map(slot => getSlotProps(slot, duration, minHour, maxHour, answers[slot])),
    slot => getDate(slot.slot)
  );

  return Object.entries(optionsByDate).map(([date, options]) => {
    return {date, optionGroups: groupOverlaps(options)};
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
          {serializeDate(toMoment({hours: hourSeries[n]}), 'k')}
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
  const answers = useSelector(getAnswers);
  const timeSlots = useSelector(getNewdleTimeslots);
  const duration = useSelector(getNewdleDuration);
  const optionsByDay = calculateOptionsPositions(timeSlots, duration, minHour, maxHour, answers);

  if (optionsByDay.length === 0) {
    return <div>No data</div>;
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={1}>
          <Hours minHour={minHour} maxHour={maxHour} />
        </Grid.Column>
        <Grid.Column width={5}>
          <AnswerCalendarDay options={optionsByDay[0]} key={optionsByDay[0].date} />
        </Grid.Column>
        <Grid.Column width={5}>
          <AnswerCalendarDay options={optionsByDay[1]} key={optionsByDay[1].date} />
        </Grid.Column>
        <Grid.Column width={5}>
          <AnswerCalendarDay options={optionsByDay[2]} key={optionsByDay[2].date} />
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
