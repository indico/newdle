import _ from 'lodash';
import {combineReducers} from 'redux';
import {
  TOKEN_EXPIRED,
  USER_LOGIN,
  USER_LOGOUT,
  USER_RECEIVED,
  SET_ACTIVE_DATE,
  SET_STEP,
  ABORT_CREATION,
  ADD_PARTICIPANTS,
  REMOVE_PARTICIPANT,
  SET_DURATION,
  ADD_TIMESLOT,
  REMOVE_TIMESLOT,
  SET_TITLE,
} from './actions';

export default combineReducers({
  auth: combineReducers({
    token: (state = null, action) => {
      switch (action.type) {
        case USER_LOGIN:
          return action.token;
        case USER_LOGOUT:
          return null;
        default:
          return state;
      }
    },
    refreshing: (state = false, action) => {
      switch (action.type) {
        case TOKEN_EXPIRED:
          return true;
        case USER_LOGIN:
        case USER_LOGOUT:
          return false;
        default:
          return state;
      }
    },
  }),
  user: (state = null, action) => {
    switch (action.type) {
      case USER_LOGOUT:
        return null;
      case USER_RECEIVED:
        return action.user;
      default:
        return state;
    }
  },
  calendar: combineReducers({
    activeDate: (state = null, action) => {
      switch (action.type) {
        case SET_STEP:
          return null;
        case ABORT_CREATION:
          return null;
        case SET_ACTIVE_DATE:
          return action.date;
        default:
          return state;
      }
    },
  }),
  timeslots: (state = {}, action) => {
    switch (action.type) {
      case ABORT_CREATION:
        return {};
      case ADD_TIMESLOT:
        return {...state, [action.date]: [...(state[action.date] || []), action.time]};
      case REMOVE_TIMESLOT: {
        const daySlots = state[action.date] || [];
        const newDaySlots = daySlots.filter(x => x !== action.time);
        if (newDaySlots.length) {
          return {...state, [action.date]: newDaySlots};
        } else {
          return _.omit(state, action.date);
        }
      }
      default:
        return state;
    }
  },
  step: (state = 1, action) => {
    switch (action.type) {
      case ABORT_CREATION:
        return 1;
      case SET_STEP:
        return action.step;
      default:
        return state;
    }
  },
  participants: (state = [], action) => {
    switch (action.type) {
      case ABORT_CREATION:
        return [];
      case ADD_PARTICIPANTS:
        return [...state, ...action.participants];
      case REMOVE_PARTICIPANT:
        return state.filter(p => p.email !== action.participant.email);
      default:
        return state;
    }
  },
  duration: (state = 15, action) => {
    switch (action.type) {
      case ABORT_CREATION:
        return 15;
      case SET_DURATION:
        return action.duration;
      default:
        return state;
    }
  },
  title: (state = '', action) => {
    switch (action.type) {
      case SET_TITLE:
        return action.title;
      default:
        return state;
    }
  },
});
