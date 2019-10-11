import {combineReducers} from 'redux';
import {
  ABORT_ANSWERING,
  ANSWER_NEWDLE_RECEIVED,
  CHOOSE_ALL_AVAILABLE,
  CHOOSE_MANUALLY,
  REPLACE_ANSWERS,
  SET_ANSWER,
  SET_ANSWER_ACTIVE_DATE,
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
});
