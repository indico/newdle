import 'moment-timezone';

import {combineReducers} from 'redux';
import auth from './auth';
import user from './user';
import creation from './creation';
import answer from './answer';
import {CLEAR_NEWDLE, NEWDLE_RECEIVED, NEWDLE_UPDATED} from '../actions';

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
});
