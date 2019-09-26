import moment from 'moment';
import {createSelector} from 'reselect';
import {serializeDate} from './util/date';

// auth
export const getToken = state => state.auth.token;
export const getLoginWindowId = state => state.auth.windowId;
export const isLoginWindowOpen = state => !!state.auth.windowId;
export const isLoggedIn = state => !!state.auth.token;
export const isAcquiringToken = state => !!state.auth.acquiringToken;

// user
export const getUserInfo = state => state.user;

// creation
export const getCalendarDates = state => Object.keys(state.creation.timeslots);
export const getCalendarActiveDate = state =>
  state.creation.calendarActiveDate || getCalendarDates(state)[0] || serializeDate(moment());
const _getAllTimeslots = state => state.creation.timeslots;
export const getTimeslotsForActiveDate = createSelector(
  _getAllTimeslots,
  getCalendarActiveDate,
  (timeslots, date) => timeslots[date] || []
);
export const getStep = state => state.creation.step;
export const getMeetingParticipants = state => state.creation.participants;
export const getParticipantNames = state => state.creation.participants.map(({name}) => ({name}));
export const areParticipantsDefined = state => state.creation.participants.length !== 0;
export const getDuration = state => state.creation.duration;
export const getTimezone = state => state.creation.timezone;
export const shouldConfirmAbortCreation = createSelector(
  _getAllTimeslots,
  areParticipantsDefined,
  (timeslots, hasParticipants) => !!Object.keys(timeslots).length || hasParticipants
);
export const getTitle = state => state.creation.title;
export const getFullTimeslots = state =>
  [].concat(
    ...Object.entries(state.creation.timeslots).map(([date, slots]) =>
      slots.map(slot => `${date}T${slot}`)
    )
  );
export const getCreatedNewdle = state => state.creation.createdNewdle;

// newdle
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
