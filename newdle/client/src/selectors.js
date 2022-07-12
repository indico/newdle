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
export const getParticipants = state => state.creation.participants;
const getUserParticipants = createSelector(getParticipants, participants =>
  participants.filter(p => !!p.auth_uid)
);
export const areParticipantsDefined = state => state.creation.participants.length !== 0;
const getAllParticipantBusyTimes = state => state.creation.busyTimes;
export const getParticipantsWithUnkownAvailabilityForDate = createSelector(
  getUserParticipants,
  getAllParticipantBusyTimes,
  (_, date) => date,
  (participants, allBusyTimes, date) => {
    const busyTimes = allBusyTimes[date] || {};
    return _.differenceBy(participants, Object.keys(busyTimes), x =>
      typeof x === 'object' ? x.auth_uid : x
    );
  }
);
export const getParticipantsBusyTimesForDate = createSelector(
  getUserParticipants,
  getAllParticipantBusyTimes,
  (_, date) => date,
  (participants, allBusyTimes, date) => {
    const busyTimes = allBusyTimes[date] || {};
    const participantsById = new Map(participants.map(p => [p.auth_uid, p]));
    return Object.entries(busyTimes).map(([uid, times]) => ({
      participant: participantsById.get(uid),
      busySlotsLoading: !times,
      busySlots: times ? times.map(([startTime, endTime]) => ({startTime, endTime})) : [],
    }));
  }
);
export const getDuration = state => state.creation.duration;
export const getTimezone = state => state.creation.timezone;
export const getCreatedNewdle = state => state.creation.createdNewdle;
export const shouldConfirmAbortCreation = createSelector(
  _getAllTimeslots,
  areParticipantsDefined,
  (timeslots, hasParticipants) => !!Object.keys(timeslots).length || hasParticipants
);
export const getTitle = state => state.creation.title;
export const getPrivacySetting = state => state.creation.private;
export const getLimitedSlotsSetting = state => state.creation.limitedSlots;
export const getNotifySetting = state => state.creation.notify;
export const getFullTimeslots = state =>
  [].concat(
    ...Object.entries(state.creation.timeslots).map(([date, slots]) =>
      slots.map(slot => `${date}T${slot}`)
    )
  );

// newdle
export const getNewdle = state => state.newdle;
export const getNewdleTimezone = state => state.newdle && state.newdle.timezone;
export const getNewdleTimeslots = state => (state.newdle && state.newdle.timeslots) || [];
export const getNewdleDuration = state => state.newdle && state.newdle.duration;
export const hasLimitedSlots = state => state.newdle && state.newdle.limited_slots;
export const getNewdleParticipants = state => (state.newdle && state.newdle.participants) || [];
export const getNumberOfParticipants = createSelector(
  getNewdleParticipants,
  participants => participants.length
);
export const newdleParticipantsWithEmail = createSelector(getNewdleParticipants, participants =>
  participants.filter(p => p.email !== null)
);
export const newdleHasParticipantsWithEmail = createSelector(
  newdleParticipantsWithEmail,
  participants => participants.length > 0
);
export const newdleParticipantsWithoutEmail = createSelector(getNewdleParticipants, participants =>
  participants.filter(p => p.email === null)
);
export const newdleHasParticipantsWithoutEmail = createSelector(
  newdleParticipantsWithoutEmail,
  participants => participants.length > 0
);
export const getParticipantAvailability = createSelector(
  getNewdle,
  getNewdleTimeslots,
  getNewdleParticipants,
  (newdle, timeslots, participants) =>
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
      x => x.startDt !== newdle.final_dt
    )
);
export const getMissingParticipants = createSelector(getNewdleParticipants, participants => {
  return participants
    .filter(part => _.isEmpty(part.answers))
    .sort((a, b) => a.name.localeCompare(b.name));
});
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
