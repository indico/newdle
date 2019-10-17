import flask from 'flask-urls.macro';
import client from './client';
import {getAnswers, isAllAvailableSelectedExplicitly} from './answerSelectors';

export const LOGIN_WINDOW_OPENED = 'Login window opened';
export const LOGIN_WINDOW_CLOSED = 'Login window closed';
export const LOGIN_PROMPT_ABORTED = 'User refused to login';
export const USER_LOGIN = 'User logged in';
export const USER_LOGOUT = 'User logged out';
export const USER_RECEIVED = 'User info received';
export const TOKEN_EXPIRED = 'Expired token needs refresh';
export const TOKEN_NEEDED = 'Login required to send request';
export const SET_CREATION_ACTIVE_DATE = 'Change creation selected date';
export const SET_STEP = 'Change Newdle creation step';
export const ABORT_CREATION = 'Abort Newdle creation';
export const NEWDLE_CREATED = 'Newdle created';
export const NEWDLE_UPDATED = 'Newdle updated';
export const ADD_PARTICIPANTS = 'Add new participants';
export const REMOVE_PARTICIPANT = 'Remove a participant';
export const SET_PARTICIPANT_BUSY_TIMES = 'Set participant busy times';
export const SET_DURATION = 'Set meeting duration';
export const ADD_TIMESLOT = 'Add new timeslot';
export const REMOVE_TIMESLOT = 'Remove a timeslot';
export const SET_TITLE = 'Set title for Newdle';
export const SET_TIMEZONE = 'Set the meeting timezone';
export const NEWDLE_RECEIVED = 'Received newdle data';
export const CLEAR_NEWDLE = 'Clear newdle data';
export const ANSWER_NEWDLE_RECEIVED = 'Received newdle data for answering';
export const ABORT_ANSWERING = 'Abort answering';
export const SET_ANSWER = 'Set newdle answer';
export const REPLACE_ANSWERS = 'Replace newdle answers';
export const SET_ANSWER_ACTIVE_DATE = 'Change answer selected date';
export const CHOOSE_ALL_AVAILABLE = 'Choose all slots where user is available';
export const CHOOSE_MANUALLY = 'Manually select available slots';
export const SET_ANSWER_BUSY_TIMES = 'Set answer busy times';
export const PARTICIPANT_RECEIVED = 'Received participant data';

export function loginWindowOpened(id) {
  return {type: LOGIN_WINDOW_OPENED, id};
}

export function loginWindowClosed() {
  return {type: LOGIN_WINDOW_CLOSED};
}

export function loginPromptAborted() {
  return {type: LOGIN_PROMPT_ABORTED};
}

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

export function tokenNeeded() {
  return {type: TOKEN_NEEDED};
}

export function setCreationActiveDate(date) {
  return {type: SET_CREATION_ACTIVE_DATE, date};
}

export function setStep(step) {
  return {type: SET_STEP, step};
}

export function abortCreation() {
  return {type: ABORT_CREATION};
}

export function newdleCreated(newdle) {
  return {type: NEWDLE_CREATED, newdle};
}

export function addParticipants(participants) {
  return {type: ADD_PARTICIPANTS, participants};
}

export function removeParticipant(participant) {
  return {type: REMOVE_PARTICIPANT, participant};
}

export function fetchParticipantBusyTimes(participants, date) {
  return async dispatch => {
    participants.forEach(async participant => {
      dispatch({type: SET_PARTICIPANT_BUSY_TIMES, id: participant.uid, date, times: null});
      const times = await client.getBusyTimes(date, participant.uid);
      dispatch({type: SET_PARTICIPANT_BUSY_TIMES, id: participant.uid, date, times});
    });
  };
}

export function setDuration(duration) {
  return {type: SET_DURATION, duration};
}

export function setTimezone(timezone) {
  return {type: SET_TIMEZONE, timezone};
}

export function addTimeslot(date, time) {
  return {type: ADD_TIMESLOT, date, time};
}

export function removeTimeslot(date, time) {
  return {type: REMOVE_TIMESLOT, date, time};
}

export function setTitle(title) {
  return {type: SET_TITLE, title};
}

export function fetchNewdle(code, fullDetails = false, action = NEWDLE_RECEIVED) {
  return async dispatch => {
    const newdle = await client.getNewdle(code, fullDetails);
    dispatch({type: action, newdle});
  };
}

export function fetchNewdleForAnswer(code) {
  return fetchNewdle(code, false, ANSWER_NEWDLE_RECEIVED);
}

export function clearNewdle() {
  return {type: CLEAR_NEWDLE};
}

export function abortAnswering() {
  return {type: ABORT_ANSWERING};
}

export function chooseAllAvailable(enabled) {
  return {type: enabled ? CHOOSE_ALL_AVAILABLE : CHOOSE_MANUALLY};
}

export function setAnswer(timeslot, answer) {
  return async (dispatch, getStore) => {
    const state = getStore();
    if (isAllAvailableSelectedExplicitly(state)) {
      const answers = getAnswers(state);
      dispatch({type: REPLACE_ANSWERS, answers});
    }
    dispatch({type: SET_ANSWER, timeslot, answer});
  };
}

export function setAnswerActiveDate(date) {
  return {type: SET_ANSWER_ACTIVE_DATE, date};
}

export function updateNewdle(newdle) {
  return {type: NEWDLE_UPDATED, newdle};
}

export function fetchBusyTimesForAnswer(newdleCode, participantCode, dates) {
  return async dispatch => {
    dates.forEach(async date => {
      const times = await client.getBusyTimes(date, null, newdleCode, participantCode);
      dispatch({type: SET_ANSWER_BUSY_TIMES, date, times});
    });
  };
}

export function fetchParticipant(newdleCode, participantCode, me = false) {
  return async dispatch => {
    const participant = await client.getParticipant(newdleCode, participantCode, me);
    if (participant) {
      dispatch({type: PARTICIPANT_RECEIVED, participant});
    }
  };
}
