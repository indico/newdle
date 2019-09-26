import _ from 'lodash';
import moment from 'moment';
import {combineReducers} from 'redux';
import {
  ABORT_CREATION,
  ADD_PARTICIPANTS,
  ADD_TIMESLOT,
  NEWDLE_CREATED,
  REMOVE_PARTICIPANT,
  REMOVE_TIMESLOT,
  SET_ACTIVE_DATE,
  SET_DURATION,
  SET_PARTICIPANT_BUSY_TIMES,
  SET_STEP,
  SET_TIMEZONE,
  SET_TITLE,
  ADD_ANSWER,
  REMOVE_ANSWER,
} from '../actions';

const DEFAULT_DURATION = 30;

export default combineReducers({
  calendarActiveDate: (state = null, action) => {
    switch (action.type) {
      case SET_STEP:
      case ABORT_CREATION:
      case NEWDLE_CREATED:
        return null;
      case SET_ACTIVE_DATE:
        return action.date;
      default:
        return state;
    }
  },
  timeslots: (state = {}, action) => {
    switch (action.type) {
      case ABORT_CREATION:
      case NEWDLE_CREATED:
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
      case NEWDLE_CREATED:
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
      case NEWDLE_CREATED:
        return [];
      case ADD_PARTICIPANTS:
        return [...state, ...action.participants];
      case REMOVE_PARTICIPANT:
        return state.filter(p => p.email !== action.participant.email);
      default:
        return state;
    }
  },
  busyTimes: (state = {}, action) => {
    switch (action.type) {
      case ABORT_CREATION:
      case NEWDLE_CREATED:
        return {};
      case SET_PARTICIPANT_BUSY_TIMES:
        return {
          ...state,
          [action.date]: {
            ...(state[action.date] || {}),
            [action.id]: action.times,
          },
        };
      default:
        return state;
    }
  },
  duration: (state = DEFAULT_DURATION, action) => {
    switch (action.type) {
      case ABORT_CREATION:
      case NEWDLE_CREATED:
        return DEFAULT_DURATION;
      case SET_DURATION:
        return action.duration;
      default:
        return state;
    }
  },
  title: (state = '', action) => {
    switch (action.type) {
      case ABORT_CREATION:
      case NEWDLE_CREATED:
        return '';
      case SET_TITLE:
        return action.title;
      default:
        return state;
    }
  },
  createdNewdle: (state = null, action) => {
    switch (action.type) {
      case NEWDLE_CREATED:
        return action.newdle;
      default:
        return state;
    }
  },
  timezone: (state = moment.tz.guess(), action) => {
    switch (action.type) {
      case ABORT_CREATION:
        return moment.tz.guess();
      case SET_TIMEZONE:
        return action.timezone;
      default:
        return state;
    }
  },
  answers: (state = {}, action) => {
    switch (action.type) {
      case ADD_ANSWER:
        return {...state, [action.timeslot]: action.answer};
      case REMOVE_ANSWER: {
        const {[action.slot]: value, ...answers} = state;
        return answers;
      }
      default:
        return state;
    }
  },
});
