import flask from 'flask-urls.macro';
import {useReducer} from 'react';
import {getToken, isAcquiringToken} from './selectors';
import {tokenExpired, tokenNeeded} from './actions';

function backendReducer(state, action) {
  switch (action.type) {
    case 'submit':
      return {...state, submitting: true, error: '', result: null};
    case 'error':
      return {...state, submitting: false, error: action.error};
    case 'success':
      return {...state, submitting: false, result: action.result};
    default:
      return state;
  }
}

class ClientError extends Error {
  constructor(url, code, message, data = null) {
    if (code) {
      super(`Request to ${url} failed (${code}): ${message}`);
    } else {
      super(`Request to ${url} failed: ${message}`);
    }
    this.data = data;
  }
}

class Client {
  store = null;

  get token() {
    if (!this.store) {
      throw new Error('Tried to use client that is not connected to a store');
    }
    return getToken(this.store.getState());
  }

  /*
   * This method returns a React hook which handles the possible states regarding backend
   * communication. It's possible to execute several backend API calls sequentially.
   * The results of the first call will be fed as parameters for the second, and so on...
   *
   * @param {Function} funcs - the client functions which will be invoked, in order. The
   * first one will receive the `call(...)` parameters, while the others will be fed the
   * results of the previous one.
   */
  useBackend(...funcs) {
    const [state, dispatch] = useReducer(backendReducer, {
      submitting: false,
      error: '',
      result: null,
    });

    const call = async (...params) => {
      const end = async result => {
        dispatch({type: 'success', result});
        return result;
      };

      dispatch({type: 'submit'});
      const f = funcs.reverse().reduce((prevPromise, func) => {
        return async (...params) => {
          try {
            const result = await func.bind(this)(...params);
            return await prevPromise(result);
          } catch (exc) {
            dispatch({type: 'error', error: exc.toString()});
          }
        };
      }, end);

      return await f(...params);
    };

    return [call, state.submitting, state.error, state.result];
  }

  getMe() {
    return this._request(flask`api.me`());
  }

  searchUsers(q) {
    return this._request(flask`api.users`({q}));
  }

  createNewdle(title, duration, timezone, timeslots, participants) {
    const params = {
      method: 'POST',
      body: JSON.stringify({title, duration, timezone, timeslots, participants}),
    };
    return this._request(flask`api.create_newdle`(), params);
  }

  getNewdle(code, fullDetails = false) {
    return this._request(flask`api.get_newdle`({code}), {anonymous: !fullDetails});
  }

  getMyNewdles() {
    return this._request(flask`api.get_my_newdles`());
  }

  getBusyTimes(date, uid, newdleCode = null, participantCode = null) {
    if (uid !== null) {
      return this._request(flask`api.get_busy_times`({date, uid}));
    } else {
      return this._request(
        flask`api.get_participant_busy_times`({
          code: newdleCode,
          participant_code: participantCode || 'me',
          date,
        }),
        {anonymous: participantCode !== null}
      );
    }
  }

  setFinalDate(code, finalDate) {
    return this._request(flask`api.update_newdle`({code}), {
      method: 'PATCH',
      body: JSON.stringify({final_dt: finalDate}),
    });
  }

  getParticipant(newdleCode, participantCode) {
    if (participantCode === null) {
      return this._request(flask`api.get_participant_me`({code: newdleCode}));
    } else {
      const params = {code: newdleCode, participant_code: participantCode};
      return this._request(flask`api.get_participant`(params), {anonymous: true});
    }
  }

  updateParticipantAnswers(newdleCode, participantCode, answers) {
    const params = {code: newdleCode, participant_code: participantCode};
    return this._request(flask`api.update_participant`(params), {
      anonymous: true,
      method: 'PATCH',
      body: JSON.stringify({
        answers,
      }),
    });
  }

  createParticipant(newdleCode, participantName, anonymous) {
    const params = {code: newdleCode};
    if (anonymous) {
      return this._request(flask`api.create_anonymous_participant`(params), {
        anonymous: true,
        method: 'POST',
        body: JSON.stringify({
          name: participantName,
        }),
      });
    } else {
      return this._request(flask`api.create_participant`(params), {
        method: 'PUT',
      });
    }
  }

  sendResultEmails(code) {
    return this._request(flask`api.send_result_emails`({code}), {
      method: 'POST',
    });
  }

  async _request(url, options = {}, withStatus = false, isRetry = false) {
    const headers = {Accept: 'application/json'};
    const {anonymous, ...fetchOptions} = {anonymous: false, ...options};
    const requestOptions = {headers, ...fetchOptions};
    let token = this.token;
    if (!anonymous) {
      if (!token) {
        console.log('Cannot send authenticated request without being logged in');
        await this._acquireToken();
        token = this.token;
        if (!token) {
          throw new ClientError(url, 0, 'Not logged in');
        }
        console.log('We got a token; continuing request');
      }
      headers.Authorization = `Bearer ${token}`;
    }
    let resp;
    try {
      resp = await fetch(url, requestOptions);
    } catch (err) {
      throw new ClientError(url, 0, err);
    }
    let data;
    try {
      data = resp.status === 204 ? '' : await resp.json();
    } catch (err) {
      throw new ClientError(url, resp.status, `Received invalid response (${err})`);
    }
    if (resp.ok) {
      return withStatus ? {data, status: resp.status} : data;
    }
    if ((data.error === 'token_expired' || data.error === 'token_invalid') && !isRetry) {
      console.log(`Request failed due to invalid token (${data.error})`);
      await this._acquireToken(true);
      if (this.token) {
        console.log('We got a new token; retrying request');
        return await this._request(url, options, withStatus, true);
      } else {
        console.log('User logged out during refresh; aborting');
      }
    }
    throw new ClientError(url, resp.status, data.error || 'Unknown error', data);
  }

  async _acquireToken(expired = false) {
    // dispatching tokenExpired will show a prompt about the expire session asking
    // the user to login again (or logout)
    if (!isAcquiringToken(this.store.getState())) {
      if (expired) {
        console.log('Asking user to login again');
        this.store.dispatch(tokenExpired());
      } else {
        console.log('Asking user to login');
        this.store.dispatch(tokenNeeded());
      }
    } else {
      console.log('Waiting for login from other refresh request');
    }
    let unsubscribe;
    await new Promise(resolve => {
      // subscribe to the store and wait until the refreshing flag we set through
      // the dispatch above has been reset. this happens only after a successful
      // login or logout
      unsubscribe = this.store.subscribe(() => {
        if (!isAcquiringToken(this.store.getState())) {
          console.log('Left refresh mode');
          resolve();
        }
      });
    });
    // once we're here the user has logged in or logged out
    unsubscribe();
  }
}

export default new Client();
