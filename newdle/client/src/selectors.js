import moment from 'moment';
import {createSelector} from 'reselect';
import {serializeDate} from './util/date';

export const getToken = state => state.auth.token;
export const isLoggedIn = state => !!state.auth.token;
export const isRefreshingToken = state => !!state.auth.refreshing;
export const getUserInfo = state => state.user;
export const getCalendarDates = state => Object.keys(state.timeslots);
export const getCalendarActiveDate = state => state.calendar.activeDate || serializeDate(moment());
const _getAllTimeslots = state => state.timeslots;
export const getTimeslotsForActiveDate = createSelector(
  _getAllTimeslots,
  getCalendarActiveDate,
  (timeslots, date) => timeslots[date] || []
);
export const getStep = state => state.step;
export const getMeetingParticipants = state => state.participants;
export const areParticipantsDefined = state => state.participants.length !== 0;
export const getDuration = state => state.duration;
