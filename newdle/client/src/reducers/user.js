import {USER_LOGOUT, USER_RECEIVED} from '../actions';

export default (state = null, action) => {
  switch (action.type) {
    case USER_LOGOUT:
      return null;
    case USER_RECEIVED:
      return action.user;
    default:
      return state;
  }
};
