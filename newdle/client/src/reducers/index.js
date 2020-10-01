import 'moment-timezone';

import {combineReducers} from 'redux';
import auth from './auth';
import user from './user';
import creation from './creation';
import answer from './answer';
import {
  CLEAR_NEWDLE,
  NEWDLE_RECEIVED,
  NEWDLE_UPDATED,
  ADD_ERROR,
  REMOVE_ERROR,
  CLEAR_ERRORS,
} from '../actions';

export default combineReducers({
  auth,
  user,
  creation,
  answer,
  // XXX: we probably want different state slices for newdle data used
  // on the answer page and on the summary, since the data is different
  newdle: (state = null, action) => {
    switch (action.type) {
      case NEWDLE_RECEIVED:
      case NEWDLE_UPDATED:
        return action.newdle;
      case CLEAR_NEWDLE:
        return null;
      default:
        return state;
    }
  },
  error: (state = [], action) => {
    switch (action.type) {
      case ADD_ERROR: {
        const id = state.length !== 0 ? state[state.length - 1].id + 1 : 0;
        return [...state, {id, error: action.error}];
      }
      case REMOVE_ERROR:
        return state.filter(error => error.id !== action.id);
      case CLEAR_ERRORS:
        return [];
      default:
        return state;
    }
  },
});
