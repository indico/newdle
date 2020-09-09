import _ from 'lodash';
import moment from 'moment';
import {createSelector} from 'reselect';
import {overlaps, serializeDate, toMoment} from './util/date';
import {getUserTimezone} from './selectors';

export const getNewdle = state => state.answer.newdle;
export const getHandpickedAnswers = state => state.answer.answers;
export const getParticipantAnswers = state =>
  state.answer.participant ? state.answer.participant.answers : {};
export const getParticipant = state => state.answer.participant;
export const isParticipantUnknown = state =>
  !state.answer.participant || state.answer.participant.auth_uid === null;
export const getNewdleDuration = state => state.answer.newdle && state.answer.newdle.duration;
export const getNewdleTimezone = state => state.answer.newdle && state.answer.newdle.timezone;
export const getNewdleTimeslots = state =>
  (state.answer.newdle && state.answer.newdle.timeslots) || [];
export const getNumberOfTimeslots = createSelector(
  getNewdleTimeslots,
  slots => slots.length
);
export const getLocalNewdleTimeslots = createSelector(
  getNewdleTimeslots,
  getUserTimezone,
  getNewdleTimezone,
  (timeslots, userTz, newdleTz) =>
    timeslots.map(timeslot =>
      serializeDate(
        toMoment(timeslot, moment.HTML5_FMT.DATETIME_LOCAL, newdleTz),
        moment.HTML5_FMT.DATETIME_LOCAL,
        userTz
      )
    )
);
/** A mapping from user-tz timeslots to newdle-tz timeslots */
const getLocalNewdleTimeslotsMap = createSelector(
  getNewdleTimeslots,
  getLocalNewdleTimeslots,
  (timeslots, localTimeslots) => _.zipObject(localTimeslots, timeslots)
);
export const getCalendarDates = createSelector(
  getLocalNewdleTimeslots,
  timeslots =>
    _.uniq(
      timeslots.map(timeslot => serializeDate(toMoment(timeslot, moment.HTML5_FMT.DATETIME_LOCAL)))
    )
);

export const getActiveDate = state =>
  state.answer.calendarActiveDate || getCalendarDates(state)[0] || serializeDate(moment());

/** Whether busy times are known */
export const hasBusyTimes = state => state.answer.busyTimes !== null;

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
  getLocalNewdleTimeslotsMap,
  getNewdleDuration,
  (busyTimes, timeslotMap, duration) => {
    busyTimes = busyTimes.map(pair => pair.map(t => toMoment(t, moment.HTML5_FMT.DATETIME_LOCAL)));
    const localTimeslots = Object.keys(timeslotMap).map(t => [
      toMoment(t, moment.HTML5_FMT.DATETIME_LOCAL),
      toMoment(t, moment.HTML5_FMT.DATETIME_LOCAL).add(duration, 'm'),
    ]);
    return localTimeslots
      .filter(ts => !busyTimes.some(bt => overlaps(ts, bt)))
      .map(([start]) => timeslotMap[serializeDate(start, moment.HTML5_FMT.DATETIME_LOCAL)])
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
      ? _.fromPairs(freeTimeslots.map(ts => [ts, 'available']))
      : handpickedAnswers;
    return _.fromPairs(timeslots.map(ts => [ts, chosenTimeslots[ts] || 'unavailable']));
  }
);
export const getNumberOfAvailableAnswers = createSelector(
  getAnswers,
  answers => Object.values(answers).filter(answer => answer === 'available').length
);

export const haveParticipantAnswersChanged = createSelector(
  getAnswers,
  getParticipantAnswers,
  (answers, participantAnswers) => {
    return !_.isEqual(answers, participantAnswers);
  }
);

/**
 * Get the participant code that was previously stored for a given newdle.
 * This is meant to be used when switching between summary and answer view
 * in order to not lose the previously-viewed participant when switching back
 * in case that participant was not linked to the current user (or there is no
 * current user).
 */
export const getStoredParticipantCodeForNewdle = createSelector(
  state => state.answer.participantCodes,
  (_, newdleCode) => newdleCode,
  (participantCodes, newdleCode) => participantCodes[newdleCode] || null
);

// TODO: move this to selectors/answers.js (and split selectors.js as well)
