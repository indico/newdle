import client from './client';

export const USER_LOGIN = 'User logged in';
export const USER_LOGOUT = 'User logged out';
export const USER_RECEIVED = 'User info received';
export const TOKEN_EXPIRED = 'Expired token needs refresh';
export const SET_ACTIVE_DATE = 'Participant changed the active day';
export const CLEAR_ACTIVE_DATE = 'Clear calendar active date';
export const SET_STEP = 'Change create Newdle step';

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
    return user;
  };
}

export function tokenExpired() {
  return {type: TOKEN_EXPIRED};
}

export function setActiveDate(date) {
  return {type: SET_ACTIVE_DATE, date};
}

export function clearCalendarActiveDate() {
  return {type: CLEAR_ACTIVE_DATE};
}

export function setStep(step) {
  return {type: SET_STEP, step};
}
