import {combineReducers} from 'redux';
import {
  TOKEN_EXPIRED,
  USER_LOGIN,
  USER_LOGOUT,
  USER_RECEIVED,
  SET_ACTIVE_DATE,
  CLEAR_ACTIVE_DATE,
  SET_STEP,
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
        case CLEAR_ACTIVE_DATE:
          return null;
        case SET_ACTIVE_DATE:
          return action.date;
        default:
          return state;
      }
    },
  }),
  step: (state = 1, action) => {
    switch (action.type) {
      case SET_STEP:
        return action.step;
      default:
        return state;
    }
  },
});
