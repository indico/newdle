import {combineReducers} from 'redux';
import {USER_LOGOUT, USER_LOGIN, USER_RECEIVED} from './actions';

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
});
