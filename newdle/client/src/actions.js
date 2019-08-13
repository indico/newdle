import flask from 'flask-urls.macro';
import client from './client';

export const USER_LOGIN = 'User logged in';
export const USER_LOGOUT = 'User logged out';
export const USER_RECEIVED = 'User info received';
export const TOKEN_EXPIRED = 'Expired token needs refresh';
export const SET_ACTIVE_DATE = 'Participant changed the active day';
export const CLEAR_ACTIVE_DATE = 'Clear calendar active date';
export const SET_STEP = 'Change create Newdle step';
export const UPDATE_PARTICIPANTS = 'Update the list of meeting participants';
export const REMOVE_PARTICIPANT = 'Remove the participant from the list';

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

export function clearCalendarActiveDate() {
  return {type: CLEAR_ACTIVE_DATE};
}

export function setStep(step) {
  return {type: SET_STEP, step};
}

export function updateParticipantList(participants) {
  return {type: UPDATE_PARTICIPANTS, participants};
}

export function removeParticipant(participant) {
  return {type: REMOVE_PARTICIPANT, participant};
}
