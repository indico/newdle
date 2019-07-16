import client from './client';

export const USER_LOGIN = 'User logged in';
export const USER_LOGOUT = 'User logged out';
export const USER_RECEIVED = 'User info received';

export function userLogin(token) {
  return async dispatch => {
    dispatch({type: USER_LOGIN, token});
    dispatch(loadUser());
  };
}

export function userLogout() {
  return {type: USER_LOGOUT};
}

export function loadUser() {
  return async dispatch => {
    const user = await client.getMe();
    dispatch({type: USER_RECEIVED, user});
  };
}
