import {combineReducers} from 'redux';
import {
  ABORT_ANSWERING,
  ANSWER_NEWDLE_RECEIVED,
  CHOOSE_ALL_AVAILABLE,
  CHOOSE_MANUALLY,
  REPLACE_ANSWERS,
  SET_ANSWER,
  SET_ANSWER_ACTIVE_DATE,
  SET_ANSWER_BUSY_TIMES,
  PARTICIPANT_RECEIVED,
  SET_PARTICIPANT_CODE,
  CLEAR_PARTICIPANT_CODES,
} from '../actions';

export default combineReducers({
  newdle: (state = null, action) => {
    switch (action.type) {
      case ANSWER_NEWDLE_RECEIVED:
        return action.newdle;
      case ABORT_ANSWERING:
        return null;
      default:
        return state;
    }
  },

  allAvailable: (state = false, action) => {
    switch (action.type) {
      case CHOOSE_ALL_AVAILABLE:
        return true;
      case CHOOSE_MANUALLY:
      case SET_ANSWER:
      case REPLACE_ANSWERS:
      case ABORT_ANSWERING:
        return false;
      default:
        return state;
    }
  },

  answers: (state = {}, action) => {
    switch (action.type) {
      case SET_ANSWER:
        return {...state, [action.timeslot]: action.answer};
      case REPLACE_ANSWERS:
        return action.answers;
      case PARTICIPANT_RECEIVED:
        return action.participant.answers;
      case ABORT_ANSWERING:
        return {};
      default:
        return state;
    }
  },

  calendarActiveDate: (state = null, action) => {
    switch (action.type) {
      case SET_ANSWER_ACTIVE_DATE:
        return action.date;
      case ABORT_ANSWERING:
        return null;
      default:
        return state;
    }
  },

  busyTimes: (state = null, action) => {
    switch (action.type) {
      case ABORT_ANSWERING:
        return null;
      case SET_ANSWER_BUSY_TIMES:
        return {
          ...(state || {}),
          [action.date]: action.times,
        };
      default:
        return state;
    }
  },

  participant: (state = null, action) => {
    switch (action.type) {
      case PARTICIPANT_RECEIVED:
        return action.participant;
      case ABORT_ANSWERING:
        return null;
      default:
        return state;
    }
  },

  participantCodes: (state = {}, action) => {
    switch (action.type) {
      case SET_PARTICIPANT_CODE:
        return {
          ...state,
          [action.newdleCode]: action.participantCode,
        };
      case CLEAR_PARTICIPANT_CODES:
        return {};
      default:
        return state;
    }
  },
});
