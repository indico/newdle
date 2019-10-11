import {combineReducers} from 'redux';
import {
  ADD_ANSWER,
  ABORT_ANSWERING,
  ANSWER_NEWDLE_RECEIVED,
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

  answers: (state = {}, action) => {
    switch (action.type) {
      case ADD_ANSWER:
        return {...state, [action.timeslot]: action.answer};
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
