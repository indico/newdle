import _ from 'lodash';
import React from 'react';
import {HTML5_FMT} from 'moment';
import PropTypes from 'prop-types';
import {Grid} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {t} from '@lingui/macro';
import {hourRange, serializeDate, toMoment, getHourSpan} from '../../util/date';
import {useIsSmallScreen, useNumDaysVisible} from '../../util/hooks';
import DayTimeline from './DayTimeline';
import {
  getActiveDate,
  getActivePosition,
  getActiveDateIndex,
  getLocalNewdleTimeslots,
  getNewdleDuration,
  getAnswers,
  getBusyTimes,
  getNewdleTimezone,
  getUserTimezone,
} from '../../answerSelectors';
import {setAnswer, setAnswerActiveDate} from '../../actions';
import DayCarousel from '../DayCarousel';

import styles from './answer.module.scss';

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

function getSlotProps(slot, duration, minHour, maxHour, answers, newdleTz, userTz) {
  const start = toMoment(slot, DEFAULT_FORMAT, userTz);
  const end = start.clone().add(duration, 'm');

  const newdleSlot = serializeDate(start, DEFAULT_FORMAT, newdleTz);
  const answer = answers[newdleSlot];
  const answerProps = getAnswerProps(newdleSlot, answer);
  const height = calculateHeight(start, end, minHour, maxHour);
  const pos = calculatePosition(start, minHour, maxHour);

  return {
    slot,
    startTime: serializeDate(start, 'H:mm'),
    endTime: serializeDate(end, 'H:mm'),
    groupDateKey: start,
    height,
    pos,
    key: slot,
    answer: answer || 'unavailable',
    ...answerProps,
  };
}

function calculateOptionsPositions(options, duration, minHour, maxHour, answers, newdleTz, userTz) {
  const optionsByDate = _.groupBy(
    options.map(slot => getSlotProps(slot, duration, minHour, maxHour, answers, newdleTz, userTz)),
    slot => serializeDate(slot.groupDateKey, HTML5_FMT.DATE)
  );

  return Object.entries(optionsByDate).map(([date, options]) => {
    return {date, optionGroups: groupOverlaps(options, duration)};
  });
}

function getBusySlotProps(slot, minHour, maxHour) {
  const [startTime, endTime] = slot;
  const start = toMoment(startTime, 'HH:mm');
  const end = toMoment(endTime, 'HH:mm');
  return {
    startTime: serializeDate(start, 'H:mm'),
    endTime: serializeDate(end, 'H:mm'),
    height: calculateHeight(start, end, minHour, maxHour),
    pos: calculatePosition(start, minHour, maxHour),
    key: `${startTime}-${endTime}`,
  };
}

function calculateBusyPositions(busyTimes, minHour, maxHour) {
  return Object.entries(busyTimes).map(([date, times]) => {
    return {date, times: times.map(slot => getBusySlotProps(slot, minHour, maxHour))};
  });
}

function calculateHourPositions(minHour, maxHour, hourStep) {
  const hourSpan = maxHour - minHour;
  return _.range(0, hourSpan + hourStep, hourStep).map(i => (i / hourSpan) * 100);
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

export default function Calendar() {
  const answers = useSelector(getAnswers);
  const timeSlots = useSelector(getLocalNewdleTimeslots);
  const duration = useSelector(getNewdleDuration);
  const busyTimes = useSelector(getBusyTimes);
  const newdleTz = useSelector(getNewdleTimezone);
  const userTz = useSelector(getUserTimezone);
  const activeDate = toMoment(useSelector(getActiveDate), HTML5_FMT.DATE);
  const activeDatePosition = useSelector(getActivePosition);
  const activeDateIndex = useSelector(getActiveDateIndex);
  const dispatch = useDispatch();

  const numDaysVisible = useNumDaysVisible();
  const defaultHourSpan = MAX_HOUR - MIN_HOUR;
  const isTabletOrMobile = useIsSmallScreen();

  if (timeSlots.length === 0) {
    return t`No data`;
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
  const optionsByDay = calculateOptionsPositions(
    timeSlots,
    duration,
    minHour,
    maxHour,
    answers,
    newdleTz,
    userTz
  );
  const busyByDay = calculateBusyPositions(busyTimes, minHour, maxHour);
  const numColumns = isTabletOrMobile ? 14 : 5;
  const isActiveDay = date => activeDate.isSame(date);

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={1}>
          <Hours minHour={minHour} maxHour={maxHour} />
        </Grid.Column>
        <DayCarousel
          numberOfVisible={numDaysVisible}
          activeIndex={activeDateIndex === -1 ? 0 : activeDateIndex}
          items={optionsByDay}
          changeItem={(nextItem, position) => {
            dispatch(setAnswerActiveDate(nextItem.date, position));
          }}
          activePosition={activeDatePosition}
          renderItem={item => (
            <Grid.Column width={numColumns} key={item.date}>
              <DayTimeline
                options={item}
                busySlots={busyByDay.find(busySlot => busySlot.date === item.date)}
                selected={isActiveDay(item.date)}
                hourPositions={calculateHourPositions(
                  minHour,
                  maxHour,
                  Hours.defaultProps.hourStep
                )}
              />
            </Grid.Column>
          )}
        />
      </Grid.Row>
    </Grid>
  );
}
