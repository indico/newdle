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
export const shouldConfirmAbortCreation = createSelector(
  _getAllTimeslots,
  areParticipantsDefined,
  (timeslots, hasParticipants) => Object.keys(timeslots).length || hasParticipants
);
export const getTitle = state => state.title;
export const getFullTimeslots = createSelector(
  _getAllTimeslots,
  getDuration,
  (timeslots, duration) =>
    [].concat(
      ...Object.keys(timeslots).map(date =>
        timeslots[date].map(time => {
          return {
            start: moment(`${date} ${time}`).format('YYYY-MM-DDThh:mm'),
            end: moment(`${date} ${time}`)
              .add(duration, 'minutes')
              .format('YYYY-MM-DDThh:mm'),
          };
        })
      )
    )
);
