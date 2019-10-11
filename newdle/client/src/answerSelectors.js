import moment from 'moment';
import {createSelector} from 'reselect';
import {serializeDate, toMoment} from './util/date';

export const getNewdle = state => state.answer.newdle;
export const getAnswers = state => state.answer.answers;
export const getNewdleDuration = state => state.answer.newdle && state.answer.newdle.duration;
export const getNewdleTimeslots = state =>
  (state.answer.newdle && state.answer.newdle.timeslots) || [];
export const getNumberOfAvailableAnswers = createSelector(
  getAnswers,
  answers => Object.values(answers).filter(answer => answer === 'available').length
);
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

// TODO: move this to selectors/answers.js (and split selectors.js as well)
