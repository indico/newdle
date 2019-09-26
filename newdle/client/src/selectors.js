import moment from 'moment';
import {createSelector} from 'reselect';
import {serializeDate} from './util/date';

export const getToken = state => state.auth.token;
export const getLoginWindowId = state => state.auth.windowId;
export const isLoginWindowOpen = state => !!state.auth.windowId;
export const isLoggedIn = state => !!state.auth.token;
export const isAcquiringToken = state => !!state.auth.acquiringToken;
export const getUserInfo = state => state.user;
export const getCalendarDates = state => Object.keys(state.timeslots);
export const getCalendarActiveDate = state =>
  state.calendarActiveDate || getCalendarDates(state)[0] || serializeDate(moment());
const _getAllTimeslots = state => state.timeslots;
export const getTimeslotsForActiveDate = createSelector(
  _getAllTimeslots,
  getCalendarActiveDate,
  (timeslots, date) => timeslots[date] || []
);
export const getStep = state => state.step;
export const getMeetingParticipants = state => state.participants;
export const getParticipantNames = state => state.participants.map(({name}) => ({name}));
export const areParticipantsDefined = state => state.participants.length !== 0;
export const getDuration = state => state.duration;
export const getTimezone = state => state.timezone;
export const shouldConfirmAbortCreation = createSelector(
  _getAllTimeslots,
  areParticipantsDefined,
  (timeslots, hasParticipants) => !!Object.keys(timeslots).length || hasParticipants
);
export const getTitle = state => state.title;
export const getFullTimeslots = state =>
  [].concat(
    ...Object.entries(state.timeslots).map(([date, slots]) => slots.map(slot => `${date}T${slot}`))
  );
export const getCreatedNewdle = state => state.createdNewdle;
export const getNewdleTimeslots = state => (state.newdle && state.newdle.timeslots) || [];
export const getNewdleDuration = state => state.newdle && state.newdle.duration;
export const getNewdleParticipants = state => (state.newdle && state.newdle.participants) || [];
export const getNumberOfParticipants = createSelector(
  getNewdleParticipants,
  participants => participants.length
);
export const getParticipantAvailability = createSelector(
  getNewdleTimeslots,
  getNewdleParticipants,
  (timeslots, participants) => {
    return timeslots.map(timeslot => {
      const available = participants
        .filter(part => ['available', 'ifneedbe'].includes(part.answers[timeslot]))
        .map(part => ({...part, fullyAvailable: part.answers[timeslot] === 'available'}));
      return {startDt: timeslot, available};
    });
  }
);
