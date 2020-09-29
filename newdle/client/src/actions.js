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
export const SET_PRIVATE = 'Keep list of participants private';
export const SET_NOTIFICATION = 'Notify creator about new answers';
export const SET_TIMEZONE = 'Set the meeting timezone';
export const NEWDLE_RECEIVED = 'Received newdle data';
export const CLEAR_NEWDLE = 'Clear newdle data';
export const ANSWER_NEWDLE_RECEIVED = 'Received newdle data for answering';
export const ABORT_ANSWERING = 'Abort answering';
export const SET_PARTICIPANT_CODE = 'Set the current participant code';
export const CLEAR_PARTICIPANT_CODES = 'Clear all participant codes';
export const SET_ANSWER = 'Set newdle answer';
export const REPLACE_ANSWERS = 'Replace newdle answers';
export const SET_ANSWER_ACTIVE_DATE = 'Change answer selected date';
export const CHOOSE_ALL_AVAILABLE = 'Choose all slots where user is available';
export const CHOOSE_MANUALLY = 'Manually select available slots';
export const SET_ANSWER_BUSY_TIMES = 'Set answer busy times';
export const SET_USER_TIMEZONE = 'Set user time zone';
export const PARTICIPANT_RECEIVED = 'Received participant data';
export const ADD_ERROR = 'Error occurred';
export const REMOVE_ERROR = 'Remove error';
export const CLEAR_ERRORS = 'Clear all the errors';
export const SELECT_LANGUAGE = 'Language selected';

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
    const user = await client.catchErrors(client.getMe());
    if (user !== undefined) {
      dispatch({type: USER_RECEIVED, user});
    }
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

export function fetchParticipantBusyTimes(participants, date, tz) {
  return async dispatch => {
    participants.forEach(async participant => {
      dispatch({type: SET_PARTICIPANT_BUSY_TIMES, id: participant.uid, date, times: null});
      const times = await client.catchErrors(client.getBusyTimes(date, tz, participant.uid));

      if (times !== undefined) {
        dispatch({type: SET_PARTICIPANT_BUSY_TIMES, id: participant.uid, date, times});
      } else {
        dispatch({type: SET_PARTICIPANT_BUSY_TIMES, id: participant.uid, date, times: []});
      }
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

export function setPrivate(isPrivate) {
  return {type: SET_PRIVATE, private: isPrivate};
}

export function setNotification(notify) {
  return {type: SET_NOTIFICATION, notify};
}

export function fetchNewdle(code, fullDetails = false, action = NEWDLE_RECEIVED) {
  return async dispatch => {
    const newdle = await client.catchErrors(client.getNewdle(code));
    if (newdle === undefined) {
      return;
    }
    if (fullDetails) {
      const participants = await client.catchErrors(client.getParticipants(code));
      // fallback to null if we don't have access. that way we don't show a blank page
      // but at least the information that is public anyway
      newdle.participants = participants || null;
    }
    dispatch({type: action, newdle});
  };
}

export function fetchNewdleForAnswer(code) {
  return fetchNewdle(code, false, ANSWER_NEWDLE_RECEIVED);
}

export function setParticipantCode(newdleCode, participantCode) {
  return {type: SET_PARTICIPANT_CODE, newdleCode, participantCode};
}

export function clearParticipantCodes() {
  return {type: CLEAR_PARTICIPANT_CODES};
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

export function setAnswerActiveDate(date, position) {
  return {type: SET_ANSWER_ACTIVE_DATE, date, position};
}

export function updateNewdle(newdle) {
  return {type: NEWDLE_UPDATED, newdle};
}

export function fetchBusyTimesForAnswer(newdleCode, participantCode, dates, tz) {
  return async dispatch => {
    dates.forEach(async date => {
      const times = await client.catchErrors(
        client.getBusyTimes(date, tz, null, newdleCode, participantCode)
      );

      if (times !== undefined) {
        dispatch({type: SET_ANSWER_BUSY_TIMES, date, times});
      }
    });
  };
}

export function fetchParticipant(newdleCode, participantCode) {
  return async dispatch => {
    const participant = await client.catchErrors(
      client.getParticipant(newdleCode, participantCode)
    );
    if (participant !== undefined && participant !== null) {
      dispatch({type: PARTICIPANT_RECEIVED, participant});
    }
  };
}

export function addError(error) {
  return {type: ADD_ERROR, error};
}

export function removeError(errorId) {
  return {type: REMOVE_ERROR, id: errorId};
}

export function clearError() {
  return {type: CLEAR_ERRORS};
}

export function setUserTimezone(timezone, persist = true) {
  if (persist) {
    localStorage.setItem('chosenTimezone', timezone);
  }
  return {type: SET_USER_TIMEZONE, timezone};
}

export function setLanguage(language) {
  localStorage.setItem('userLanguage', language);
  return {type: SELECT_LANGUAGE, language};
}
