import _ from 'lodash';
import moment from 'moment';
import {createSelector} from 'reselect';
import {serializeDate, toMoment, DEFAULT_TIME_FORMAT} from './util/date';

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
export const getUserTimezone = () => moment.tz.guess();

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
export const getPrivacySetting = state => state.creation.private;
export const getFullTimeslots = state =>
  [].concat(
    ...Object.entries(state.creation.timeslots).map(([date, slots]) =>
      slots.map(slot => `${date}T${slot}`)
    )
  );
export const getCreatedNewdle = state => state.creation.createdNewdle;

// newdle
export const getNewdle = state => state.newdle;
export const getNewdleTimezone = state => state.newdle && state.newdle.timezone;
export const getNewdleTimeslots = state => (state.newdle && state.newdle.timeslots) || [];
export const getNewdleDuration = state => state.newdle && state.newdle.duration;
export const getNewdleParticipants = state => (state.newdle && state.newdle.participants) || [];
export const getNumberOfParticipants = createSelector(
  getNewdleParticipants,
  participants => participants.length
);
export const newdleParticipantsWithEmail = createSelector(
  getNewdleParticipants,
  participants => participants.filter(p => p.email !== null)
);
export const newdleHasParticipantsWithEmail = createSelector(
  newdleParticipantsWithEmail,
  participants => participants.length > 0
);
export const newdleParticipantsWithoutEmail = createSelector(
  getNewdleParticipants,
  participants => participants.filter(p => p.email === null)
);
export const newdleHasParticipantsWithoutEmail = createSelector(
  newdleParticipantsWithoutEmail,
  participants => participants.length > 0
);
export const getParticipantAvailability = createSelector(
  getNewdle,
  getNewdleTimeslots,
  getNewdleParticipants,
  ({final_dt}, timeslots, participants) =>
    _.sortBy(
      timeslots.map(timeslot => {
        const available = participants
          .filter(part => ['available', 'ifneedbe'].includes(part.answers[timeslot]))
          .map(part => ({...part, status: part.answers[timeslot]}))
          .sort((a, b) => a.name.localeCompare(b.name));
        const unavailable = participants
          .filter(part => part.answers[timeslot] === 'unavailable')
          .map(part => ({...part, status: part.answers[timeslot]}))
          .sort((a, b) => a.name.localeCompare(b.name));
        return {
          startDt: timeslot,
          participants: available.concat(unavailable),
          unavailableCount: unavailable.length,
          availableCount: available.length,
        };
      }),
      x => x.startDt !== final_dt
    )
);
export const getMissingParticipants = createSelector(
  getNewdleParticipants,
  participants => {
    return participants
      .filter(part => _.isEmpty(part.answers))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
);
export const getPreviousDayTimeslots = createSelector(
  _getAllTimeslots,
  getCreationCalendarActiveDate,
  (timeslots, date) => {
    const closestDate = Object.keys(timeslots)
      .sort()
      .filter(x => x < date)
      .pop();
    return closestDate ? timeslots[closestDate] : null;
  }
);
export const getNewTimeslotStartTime = createSelector(
  _getAllTimeslots,
  getCreationCalendarActiveDate,
  getPreviousDayTimeslots,
  getDuration,
  (timeslots, date, pastTimeslots, duration) => {
    const slotsOnDate = new Set(timeslots[date] || []);
    if (pastTimeslots !== null) {
      const unusedSlots = pastTimeslots.filter(slot => !slotsOnDate.has(slot)).sort();
      // do we have an unused slot from the previous date?
      if (unusedSlots.length) {
        return unusedSlots[0];
      }
    }
    return timeslots[date]
      ? moment
          .max(timeslots[date].map(slot => toMoment(slot, DEFAULT_TIME_FORMAT)))
          .add(duration, 'm')
          .format(DEFAULT_TIME_FORMAT)
      : '10:00';
  }
);
