import _ from 'lodash';
import React from 'react';
import moment, {HTML5_FMT} from 'moment';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {Grid} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../../util/date';
import DayTimeline from './DayTimeline';
import {
  getActiveDate,
  getNewdleTimeslots,
  getNewdleDuration,
  getAnswers,
} from '../../answerSelectors';
import {setAnswer, setAnswerActiveDate} from '../../actions';
import DayCarousel from '../DayCarousel';
import styles from './answer.module.scss';

const OVERFLOW_HEIGHT = 0.5;
const MIN_HOUR = 8;
const MAX_HOUR = 20;

function calculateHeight(start, end, minHour, maxHour, duration) {
  let startMins = start.hours() * 60 + start.minutes();
  let endMins = end.hours() * 60 + end.minutes();

  if (startMins < minHour * 60) {
    startMins = minHour * 60;
  }
  if (endMins > maxHour * 60) {
    endMins = maxHour * 60;
  }
  const height = ((endMins - startMins) / ((maxHour - minHour) * 60)) * 100;
  const minHeight = (duration / ((maxHour - minHour) * 60)) * 100;
  return height > minHeight ? height : minHeight;
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
      clusterId++;
    }
    return {...option, clusterId};
  });
  // group overlapping options
  return Object.values(_.groupBy(clusteredOptions, 'clusterId'));
}

function getAnswerProps(slot, answer) {
  if (answer === 'available') {
    return {
      icon: 'check square outline',
      action: () => setAnswer(slot, 'ifneedbe'),
      className: styles.available,
    };
  } else if (answer === 'ifneedbe') {
    return {
      icon: 'minus square outline',
      action: () => setAnswer(slot, 'unavailable'),
      className: styles.ifneedbe,
    };
  } else {
    return {
      icon: 'square outline',
      action: () => setAnswer(slot, 'available'),
      className: styles.unavailable,
    };
  }
}

function getSlotProps(slot, duration, minHour, maxHour, answer) {
  const start = toMoment(slot, moment.HTML5_FMT.DATETIME_LOCAL);
  const end = toMoment(start).add(duration, 'm');
  const answerProps = getAnswerProps(slot, answer);
  const height = calculateHeight(start, end, minHour, maxHour, duration);
  const pos = calculatePosition(start, minHour, maxHour);

  return {
    slot,
    startTime: serializeDate(start, 'HH:mm'),
    endTime: serializeDate(end, 'HH:mm'),
    height,
    pos,
    key: slot,
    answer: answer || 'unavailable',
    ...answerProps,
  };
}

function calculateOptionsPositions(options, duration, minHour, maxHour, answers) {
  const optionsByDate = _.groupBy(
    options.map(slot => getSlotProps(slot, duration, minHour, maxHour, answers[slot])),
    slot => serializeDate(toMoment(slot.slot, moment.HTML5_FMT.DATETIME_LOCAL))
  );

  return Object.entries(optionsByDate).map(([date, options]) => {
    return {date, optionGroups: groupOverlaps(options)};
  });
}

function Hours({minHour, maxHour, hourStep}) {
  const hourSeries = _.range(minHour, maxHour + hourStep > 24 ? 24 : maxHour + hourStep, hourStep);
  const hourSpan = maxHour - minHour;
  return (
    <div className={styles['hours-column']}>
      {_.range(0, hourSpan + hourStep, hourStep).map((i, n) => (
        <div
          className={styles.hour}
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

export default function Calendar() {
  const answers = useSelector(getAnswers);
  const timeSlots = useSelector(getNewdleTimeslots);
  const duration = useSelector(getNewdleDuration);
  const activeDate = toMoment(useSelector(getActiveDate), HTML5_FMT.DATE);
  const dispatch = useDispatch();
  let minHour = moment
    .min(timeSlots.map(timeSlot => toMoment(timeSlot.split('T')[1], HTML5_FMT.TIME)))
    .startOf('hour')
    .hour();
  let maxHour =
    moment
      .max(
        timeSlots.map(timeSlot =>
          toMoment(timeSlot.split('T')[1], HTML5_FMT.TIME).add(duration, 'm')
        )
      )
      .startOf('hour')
      .hour() || 24;

  if (minHour > MIN_HOUR) {
    minHour = MIN_HOUR;
  }
  if (maxHour < MAX_HOUR) {
    maxHour = MAX_HOUR;
  }

  if (timeSlots.length === 0) {
    return 'No data';
  }

  const optionsByDay = calculateOptionsPositions(timeSlots, duration, minHour, maxHour, answers);
  const activeDateIndex = optionsByDay.findIndex(({date: timeSlotDate}) =>
    toMoment(timeSlotDate, HTML5_FMT.DATE).isSame(activeDate, 'day')
  );

  return (
    <Grid className={styles.calendar}>
      <Grid.Row>
        <Grid.Column width={1}>
          <Hours minHour={minHour} maxHour={maxHour} />
        </Grid.Column>
        <DayCarousel
          start={activeDateIndex === -1 ? 0 : activeDateIndex}
          items={optionsByDay}
          changeItem={nextItem => dispatch(setAnswerActiveDate(nextItem.date))}
          renderItem={item => (
            <Grid.Column width={5} key={item.date}>
              <DayTimeline options={item} />
            </Grid.Column>
          )}
        />
      </Grid.Row>
    </Grid>
  );
}
