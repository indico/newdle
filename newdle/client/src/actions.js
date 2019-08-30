import flask from 'flask-urls.macro';
import client from './client';

export const USER_LOGIN = 'User logged in';
export const USER_LOGOUT = 'User logged out';
export const USER_RECEIVED = 'User info received';
export const TOKEN_EXPIRED = 'Expired token needs refresh';
export const SET_ACTIVE_DATE = 'Change selected date';
export const SET_STEP = 'Change Newdle creation step';
export const ABORT_CREATION = 'Abort Newdle creation';
export const ADD_PARTICIPANTS = 'Add new participants';
export const REMOVE_PARTICIPANT = 'Remove a participant';
export const SET_DURATION = 'Set meeting duration';
export const ADD_TIMESLOT = 'Add new timeslot';
export const REMOVE_TIMESLOT = 'Remove a timeslot';

export function userLogin(token) {
  return async dispatch => {
    dispatch({type: USER_LOGIN, token});
    dispatch(loadUser());
  };
}

export function userLogout() {
  return async dispatch => {
    dispatch({type: USER_LOGOUT});
    window.location.href = flask`auth.logout`();
  };
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

export function setStep(step) {
  return {type: SET_STEP, step};
}

export function abortCreation() {
  return {type: ABORT_CREATION};
}

export function addParticipants(participants) {
  return {type: ADD_PARTICIPANTS, participants};
}

export function removeParticipant(participant) {
  return {type: REMOVE_PARTICIPANT, participant};
}

export function setDuration(duration) {
  return {type: SET_DURATION, duration};
}

export function addTimeslot(date, time) {
  return {type: ADD_TIMESLOT, date, time};
}

export function removeTimeslot(date, time) {
  return {type: REMOVE_TIMESLOT, date, time};
}
