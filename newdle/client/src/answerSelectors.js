import _ from 'lodash';
import moment from 'moment';
import {createSelector} from 'reselect';
import {overlaps, serializeDate, toMoment} from './util/date';

export const getNewdle = state => state.answer.newdle;
export const getHandpickedAnswers = state => state.answer.answers;
export const getParticipantAnswers = state =>
  state.answer.participant ? state.answer.participant.answers : {};
export const getParticipant = state => state.answer.participant;
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
    _.uniq(
      timeslots.map(timeslot => serializeDate(toMoment(timeslot, moment.HTML5_FMT.DATETIME_LOCAL)))
    )
);
export const getActiveDate = state =>
  state.answer.calendarActiveDate || getCalendarDates(state)[0] || serializeDate(moment());

/** All "busy" times, indexed by day */
export const getBusyTimes = state => state.answer.busyTimes || {};

/** All "busy" times, flat version */
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

/** Whether the "accept all option where I'm available" option is checked in the UI */
export const isAllAvailableSelectedExplicitly = state => state.answer.allAvailable;

/** All time slots during which the person is free */
const getFreeTimeslots = createSelector(
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

/**
 * Whether the "accept all options..." option should be checked (implicitly)
 * (meaning that all options have been accepted "by hand")
 */
export const isAllAvailableSelectedImplicitly = createSelector(
  getFreeTimeslots,
  getHandpickedAnswers,
  (freeTimeslots, answers) => {
    if (Object.values(answers).some(x => x === 'ifneedbe')) {
      return false;
    }
    const availableAnswers = Object.entries(answers)
      .filter(([, answer]) => answer === 'available')
      .map(([ts]) => ts)
      .sort();
    if (!freeTimeslots.length) {
      return false;
    }
    return _.isEqual(freeTimeslots, availableAnswers);
  }
);

/**
 * Whether "accept all options" should be shown as selected
 * (due to being set explicitly or implicitly)
 */
export const isAllAvailableSelected = createSelector(
  isAllAvailableSelectedExplicitly,
  isAllAvailableSelectedImplicitly,
  (explicit, implicit) => explicit || implicit
);

/** Get all answers, taking into account the "accept all options" checkbox */
export const getAnswers = createSelector(
  getHandpickedAnswers,
  isAllAvailableSelected,
  getNewdleTimeslots,
  getFreeTimeslots,
  (handpickedAnswers, allAvailableSelected, timeslots, freeTimeslots) => {
    const chosenTimeslots = allAvailableSelected
      ? Object.fromEntries(freeTimeslots.map(ts => [ts, 'available']))
      : handpickedAnswers;
    return Object.fromEntries(timeslots.map(ts => [ts, chosenTimeslots[ts] || 'unavailable']));
  }
);
export const getNumberOfAvailableAnswers = createSelector(
  getAnswers,
  answers => Object.values(answers).filter(answer => answer === 'available').length
);

// TODO: move this to selectors/answers.js (and split selectors.js as well)
