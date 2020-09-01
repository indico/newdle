import _ from 'lodash';
import React from 'react';
import HTML5_FMT from 'moment';
import PropTypes from 'prop-types';
import {Grid} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {hourRange, serializeDate, toMoment, getHourSpan} from '../../util/date';
import {useIsSmallScreen} from '../../util/hooks';
import DayTimeline from './DayTimeline';
import {
  getActiveDate,
  getNewdleTimeslots,
  getNewdleDuration,
  getAnswers,
  getBusyTimes,
  getNewdleTimezone,
} from '../../answerSelectors';
import {setAnswer, setAnswerActiveDate} from '../../actions';
import DayCarousel from '../DayCarousel';
import styles from './answer.module.scss';
import {getUserTimezone} from '../../selectors';

const OVERFLOW_HEIGHT = 0.5;
const DEFAULT_FORMAT = HTML5_FMT.DATETIME_LOCAL;
const MIN_HOUR = 8;
const MAX_HOUR = 24;

function calculateHeight(start, end, minHour, maxHour) {
  let startMins = start.hours() * 60 + start.minutes();
  let endMins;

  if (start.day() === end.day()) {
    endMins = end.hours() * 60 + end.minutes();
  } else if (end.day() !== start.day()) {
    // the end of the slot is on another day so we will allow the slot to overflow
    endMins = maxHour * 60 + end.minutes();
  }

  if (startMins < minHour * 60) {
    startMins = minHour * 60;
  }

  return ((endMins - startMins) / ((maxHour - minHour) * 60)) * 100;
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

function groupOverlaps(options, duration) {
  // sort options
  const sortedOptions = _.orderBy(options, ['pos'], ['asc']);
  // mark items that overlap with their successors
  let clusterId = 0;
  const clusteredOptions = sortedOptions.map((option, index, sortedOptions) => {
    if (
      sortedOptions[index - 1] &&
      toMoment(option.startTime, 'HH:mm').isSameOrAfter(
        toMoment(sortedOptions[index - 1].startTime, 'HH:mm')
          .clone()
          .add(duration, 'm')
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

function getSlotProps(slot, duration, minHour, maxHour, answer, newdleTz, userTz) {
  const start = toMoment(slot, DEFAULT_FORMAT);
  const end = toMoment(start).add(duration, 'm');
  const answerProps = getAnswerProps(slot, answer);
  const height = calculateHeight(start, end, minHour, maxHour);

  let startMomentLocal = toMoment(slot, DEFAULT_FORMAT, newdleTz).tz(userTz);
  const pos = calculatePosition(startMomentLocal, minHour, maxHour);
  const startTimeLocal = serializeDate(startMomentLocal, 'HH:mm', userTz);
  const endTimeLocal = serializeDate(startMomentLocal.clone().add(duration, 'm'), 'HH:mm', userTz);

  return {
    slot,
    startTime: serializeDate(start, 'HH:mm'),
    endTime: serializeDate(end, 'HH:mm'),
    startTimeLocal,
    endTimeLocal,
    groupDateKey: startMomentLocal,
    height,
    pos,
    key: slot,
    answer: answer || 'unavailable',
    ...answerProps,
  };
}

function calculateOptionsPositions(options, duration, minHour, maxHour, answers, newdleTz, userTz) {
  const optionsByDate = _.groupBy(
    options.map(slot =>
      getSlotProps(slot, duration, minHour, maxHour, answers[slot], newdleTz, userTz)
    ),
    slot => serializeDate(slot.groupDateKey, HTML5_FMT.DATE, userTz)
  );

  return Object.entries(optionsByDate).map(([date, options]) => {
    return {date, optionGroups: groupOverlaps(options, duration)};
  });
}

function getBusySlotProps(slot, minHour, maxHour, date, newdleTz, userTz) {
  const [startTime, endTime] = slot;
  const start = toMoment(startTime, 'HH:mm', newdleTz);
  const end = toMoment(endTime, 'HH:mm', newdleTz);

  const startDatetime = toMoment([date, startTime].join('T'), DEFAULT_FORMAT, newdleTz).tz(userTz);
  const pos = calculatePosition(startDatetime, minHour, maxHour);
  const startTimeLocal = serializeDate(startDatetime, 'HH:mm', userTz);
  const endTimeLocal = serializeDate(end.clone().tz(userTz), 'HH:mm', userTz);

  return {
    startTime,
    endTime,
    startTimeLocal,
    endTimeLocal,
    groupDateKey: startDatetime,
    height: calculateHeight(start, end, minHour, maxHour),
    pos,
    key: `${startTimeLocal}-${endTimeLocal}`,
  };
}

function calculateBusyPositions(busyTimes, minHour, maxHour, newdleTz, userTz) {
  const busySlots = [];
  Object.entries(busyTimes).forEach(([date, times]) => {
    busySlots.push(
      ...times.map(slot => getBusySlotProps(slot, minHour, maxHour, date, newdleTz, userTz))
    );
  });

  const busyByDate = _.groupBy(busySlots, slot =>
    serializeDate(slot.groupDateKey, HTML5_FMT.DATE, userTz)
  );

  return Object.entries(busyByDate).map(([date, times]) => {
    return {date, times};
  });
}

function Hours({minHour, maxHour, hourStep}) {
  const hourSeries = hourRange(minHour, maxHour, hourStep);
  const hourSpan = maxHour - minHour;
  return (
    <div className={styles['hours-column']}>
      {_.range(0, hourSpan + hourStep, hourStep).map((i, n) => (
        <div
          className={styles.hour}
          key={`hour-label-${i}`}
          style={{top: `${(i / hourSpan) * 100}%`}}
        >
          {n === 0 && hourSeries[n] === 0
            ? '0'
            : serializeDate(toMoment({hours: hourSeries[n]}), 'k')}
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

function getLocalHour(hour, newdleTz, userTz) {
  let moment = toMoment(hour, 'HH', newdleTz);
  let localHour = serializeDate(moment, 'HH', userTz);
  return parseInt(localHour);
}

export default function Calendar() {
  const answers = useSelector(getAnswers);
  const timeSlots = useSelector(getNewdleTimeslots);
  const duration = useSelector(getNewdleDuration);
  const busyTimes = useSelector(getBusyTimes);
  const newdleTz = useSelector(getNewdleTimezone);
  const userTz = useSelector(getUserTimezone);
  const activeDate = toMoment(useSelector(getActiveDate), HTML5_FMT.DATE, userTz);
  const dispatch = useDispatch();

  const defaultHourSpan = MAX_HOUR - MIN_HOUR;
  const isTabletOrMobile = useIsSmallScreen();

  if (timeSlots.length === 0) {
    return 'No data';
  }

  const format = DEFAULT_FORMAT;
  const input = {
    timeSlots,
    defaultHourSpan,
    defaultMinHour: MIN_HOUR,
    defaultMaxHour: MAX_HOUR,
    duration,
    format,
  };
  const [minHour, maxHour] = getHourSpan(input);
  const minHourLocal = getLocalHour(minHour, newdleTz, userTz);
  const maxHourLocal = getLocalHour(maxHour, newdleTz, userTz);
  const optionsByDay = calculateOptionsPositions(
    timeSlots,
    duration,
    minHourLocal,
    maxHourLocal,
    answers,
    newdleTz,
    userTz
  );
  const busyByDay = calculateBusyPositions(busyTimes, minHourLocal, maxHourLocal, newdleTz, userTz);
  const activeDateIndex = optionsByDay.findIndex(({date: timeSlotDate}) =>
    toMoment(timeSlotDate, HTML5_FMT.DATE, newdleTz)
      .tz(userTz)
      .isSame(activeDate, 'day')
  );
  const numDaysVisible = isTabletOrMobile ? 1 : 3;
  const numColumns = isTabletOrMobile ? 14 : 5;
  return (
    <Grid className={styles.calendar}>
      <Grid.Row>
        <Grid.Column width={1}>
          <Hours minHour={minHourLocal} maxHour={maxHourLocal} />
        </Grid.Column>
        <DayCarousel
          numberOfVisible={numDaysVisible}
          start={activeDateIndex === -1 ? 0 : activeDateIndex}
          items={optionsByDay}
          changeItem={nextItem => dispatch(setAnswerActiveDate(nextItem.date))}
          renderItem={item => (
            <Grid.Column width={numColumns} key={item.date}>
              <DayTimeline
                options={item}
                busySlots={busyByDay.find(busySlot => busySlot.date === item.date)}
              />
            </Grid.Column>
          )}
        />
      </Grid.Row>
    </Grid>
  );
}
