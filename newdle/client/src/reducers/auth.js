import {combineReducers} from 'redux';
import {
  LOGIN_PROMPT_ABORTED,
  LOGIN_WINDOW_CLOSED,
  LOGIN_WINDOW_OPENED,
  TOKEN_EXPIRED,
  TOKEN_NEEDED,
  USER_LOGIN,
  USER_LOGOUT,
} from '../actions';

export default combineReducers({
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
  acquiringToken: (state = false, action) => {
    switch (action.type) {
      case TOKEN_EXPIRED:
      case TOKEN_NEEDED:
        return true;
      case USER_LOGIN:
      case USER_LOGOUT:
      case LOGIN_PROMPT_ABORTED:
        return false;
      default:
        return state;
    }
  },
  windowId: (state = null, action) => {
    switch (action.type) {
      case LOGIN_WINDOW_OPENED:
        return action.id;
      case LOGIN_WINDOW_CLOSED:
      case USER_LOGIN:
        return null;
      default:
        return state;
    }
  },
});
