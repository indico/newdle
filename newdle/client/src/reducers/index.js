import 'moment-timezone';

import {combineReducers} from 'redux';
import auth from './auth';
import user from './user';
import creation from './creation';
import {CLEAR_NEWDLE, NEWDLE_RECEIVED} from '../actions';

export default combineReducers({
  auth,
  user,
  ...creation, // TODO: namespace this into a `creation` slice
  // XXX: we probably want different state slices for newdle data used
  // on the answer page and on the summary, since the data is different
  newdle: (state = null, action) => {
    switch (action.type) {
      case NEWDLE_RECEIVED:
        return action.newdle;
      case CLEAR_NEWDLE:
        return null;
      default:
        return state;
    }
  },
});
