import _ from 'lodash';
import moment from 'moment';
import {createSelector} from 'reselect';
import {overlaps, serializeDate, toMoment} from './util/date';

export const getNewdle = state => state.answer.newdle;
const getHandpickedAnswers = state => state.answer.answers;
export const getNewdleDuration = state => state.answer.newdle && state.answer.newdle.duration;
export const getNewdleTimeslots = state =>
  (state.answer.newdle && state.answer.newdle.timeslots) || [];
export const getNumberOfTimeslots = createSelector(
  getNewdleTimeslots,
  slots => slots.length
);
export const getCalendarDates = createSelector(
  getNewdleTimeslots,
  timeslots =>
    timeslots.map(timeslot => serializeDate(toMoment(timeslot, moment.HTML5_FMT.DATETIME_LOCAL)))
);
export const getActiveDate = state =>
  state.answer.calendarActiveDate || getCalendarDates(state)[0] || serializeDate(moment());

export const getBusyTimes = state => state.answer.busyTimes;

const getFlatBusyTimes = createSelector(
  getBusyTimes,
  busyTimes =>
    [].concat(
      ...Object.entries(busyTimes).map(([date, slots]) => {
        return slots.map(([start, end]) => {
          if (end === '00:00' || end === '24:00') {
            // XXX: decide what the API returns for midnight and also for busy slots reaching into
            // the next day. should such periods be clamped to end at midnight or not? if not,
            // this gets much more complex since we might need to return a full datetime, which
            // won't work well with the grouping by dates we have right now.
            // also, ending at 23:59 is pretty ugly... but having different days may be
            // problematic as well depending on what we do with it later
            const endDate = toMoment(date, moment.HTML5_FMT.DATE)
              .endOf('day')
              .format(moment.HTML5_FMT.DATETIME_LOCAL);
            return [`${date}T${start}`, endDate];
          } else {
            return [`${date}T${start}`, `${date}T${end}`];
          }
        });
      })
    )
);
export const isAllAvailableSelectedExplicitly = state => state.answer.allAvailable;
const getAvailableTimeslots = createSelector(
  getFlatBusyTimes,
  getNewdleTimeslots,
  getNewdleDuration,
  (busyTimes, timeslots, duration) => {
    busyTimes = busyTimes.map(pair => pair.map(t => toMoment(t, moment.HTML5_FMT.DATETIME_LOCAL)));
    timeslots = timeslots.map(t => [
      toMoment(t, moment.HTML5_FMT.DATETIME_LOCAL),
      toMoment(t, moment.HTML5_FMT.DATETIME_LOCAL).add(duration, 'm'),
    ]);
    return timeslots
      .filter(ts => !busyTimes.some(bt => overlaps(ts, bt)))
      .map(([start]) => serializeDate(start, moment.HTML5_FMT.DATETIME_LOCAL))
      .sort();
  }
);
export const isAllAvailableSelectedImplicitly = createSelector(
  getAvailableTimeslots,
  getHandpickedAnswers,
  (availableTimeslots, answers) => {
    if (Object.values(answers).some(x => x === 'ifneedbe')) {
      return false;
    }
    const availableAnswers = Object.entries(answers)
      .filter(([, answer]) => answer === 'available')
      .map(([ts]) => ts)
      .sort();
    return _.isEqual(availableTimeslots, availableAnswers);
  }
);
export const isAllAvailableSelected = createSelector(
  isAllAvailableSelectedExplicitly,
  isAllAvailableSelectedImplicitly,
  (explicit, implicit) => explicit || implicit
);
export const getAnswers = createSelector(
  getHandpickedAnswers,
  isAllAvailableSelected,
  getNewdleTimeslots,
  getAvailableTimeslots,
  (handpickedAnswers, allAvailableSelected, timeslots, availableTimeslots) => {
    const chosenTimeslots = allAvailableSelected
      ? Object.fromEntries(availableTimeslots.map(ts => [ts, 'available']))
      : handpickedAnswers;
    return Object.fromEntries(timeslots.map(ts => [ts, chosenTimeslots[ts] || 'unavailable']));
  }
);
export const getNumberOfAvailableAnswers = createSelector(
  getAnswers,
  answers => Object.values(answers).filter(answer => answer === 'available').length
);

// TODO: move this to selectors/answers.js (and split selectors.js as well)
