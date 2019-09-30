import _ from 'lodash';
import {combineReducers} from 'redux';
import {ADD_ANSWER, REMOVE_ANSWER} from '../actions';

export default combineReducers({
  answers: (state = {}, action) => {
    switch (action.type) {
      case ADD_ANSWER:
        return {...state, [action.timeslot]: action.answer};
      case REMOVE_ANSWER: {
        const {[action.timeslot]: value, ...answers} = state;
        return answers;
      }
      default:
        return state;
    }
  },
});
