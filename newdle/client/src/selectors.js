import _ from 'lodash';
import moment from 'moment';
import {createSelector} from 'reselect';
import {serializeDate} from './util/date';

// error
export const getErrors = state => state.error;

// auth
export const getToken = state => state.auth.token;
export const getLoginWindowId = state => state.auth.windowId;
export const isLoginWindowOpen = state => !!state.auth.windowId;
export const isLoggedIn = state => !!state.auth.token;
export const isAcquiringToken = state => !!state.auth.acquiringToken;

// user
export const getUserInfo = state => state.user;

// creation
export const getCreationCalendarDates = state => Object.keys(state.creation.timeslots);
export const getCreationCalendarActiveDate = state =>
  state.creation.calendarActiveDate ||
  getCreationCalendarDates(state)[0] ||
  serializeDate(moment());
const _getAllTimeslots = state => state.creation.timeslots;
export const getTimeslotsForActiveDate = createSelector(
  _getAllTimeslots,
  getCreationCalendarActiveDate,
  (timeslots, date) => timeslots[date] || []
);
export const getStep = state => state.creation.step;
export const getMeetingParticipants = state => state.creation.participants;
export const getParticipantData = state =>
  state.creation.participants.map(({name, email, uid, signature}) => ({
    name,
    email,
    auth_uid: uid,
    signature,
  }));
export const areParticipantsDefined = state => state.creation.participants.length !== 0;
const getAllParticipantBusyTimes = state => state.creation.busyTimes;
export const getParticipantsWithUnkownAvailabilityForDate = createSelector(
  getMeetingParticipants,
  getAllParticipantBusyTimes,
  (_, date) => date,
  (participants, allBusyTimes, date) => {
    const busyTimes = allBusyTimes[date] || {};
    return _.differenceBy(participants, Object.keys(busyTimes), x =>
      typeof x === 'object' ? x.uid : x
    );
  }
);
export const getParticipantsBusyTimesForDate = createSelector(
  getMeetingParticipants,
  getAllParticipantBusyTimes,
  (_, date) => date,
  (participants, allBusyTimes, date) => {
    const busyTimes = allBusyTimes[date] || {};
    const participantsById = new Map(participants.map(p => [p.uid, p]));
    return Object.entries(busyTimes).map(([uid, times]) => ({
      participant: participantsById.get(uid),
      busySlotsLoading: !times,
      busySlots: times ? times.map(([startTime, endTime]) => ({startTime, endTime})) : [],
    }));
  }
);
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
export const getNewdle = state => state.newdle;
export const getNewdleTitle = state => (state.newdle && state.newdle.title) || null;
export const getNewdleTimeslots = state => (state.newdle && state.newdle.timeslots) || [];
export const getNewdleDuration = state => state.newdle && state.newdle.duration;
export const getNewdleFinalDt = state => (state.newdle && state.newdle.final_dt) || null;
export const getNewdleParticipants = state => (state.newdle && state.newdle.participants) || [];
export const getNumberOfParticipants = createSelector(
  getNewdleParticipants,
  participants => participants.length
);
export const newdleHasParticipantsWithEmail = createSelector(
  getNewdleParticipants,
  participants => participants.some(p => p.email !== null)
);
export const newdleHasParticipantsWithoutEmail = createSelector(
  getNewdleParticipants,
  participants => participants.some(p => p.email === null)
);
export const getParticipantAvailability = createSelector(
  getNewdleTimeslots,
  getNewdleParticipants,
  (timeslots, participants) => {
    return timeslots.map(timeslot => {
      let participationCount = {available: 0, ifneedbe: 0};
      let available = [];
      participants.forEach(part => {
        if (part.answers[timeslot] === 'ifneedbe') {
          participationCount['ifneedbe'] += 1;
        } else if (part.answers[timeslot] === 'available') {
          participationCount['available'] += 1;
          available.push({...part, fullyAvailable: part.answers[timeslot] === 'available'});
        }
      });
      return {startDt: timeslot, available, participationCount};
    });
  }
);
