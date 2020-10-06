import {useEffect, useReducer} from 'react';
import flask from 'flask-urls.macro';
import {tokenExpired, tokenNeeded, addError} from './actions';
import {getToken, isAcquiringToken} from './selectors';

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

  /**
   * This method returns a React hook which handles the possible states regarding backend
   * communication. It's possible to execute several backend API calls sequentially.
   * The results of the first call will be fed as parameters for the second, and so on...
   *
   * @param {Function} funcs - the client functions which will be invoked, in order. The
   * first one will receive the `call(...)` parameters, while the others will be fed the
   * results of the previous one.
   */
  useBackendLazy(...funcs) {
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
          } catch (err) {
            dispatch({type: 'error', error: err.toString()});
            this.store.dispatch(addError(err.message));
          }
        };
      }, end);

      return await f(...params);
    };
    return [call, state.submitting, state.error, state.result];
  }

  /**
   * `useBackendLazy` works fine for methods that are invoked manually (e.g. clicking a button) but may cause problems
   * when used in conjunction with `useEffect` which relies on the identity of its dependencies. `useBackend` solves
   * this problem by calling the passed `func` immediatelly and returning relevant data.
   *
   * @param {Function} func - function that will be called every time `deps` change.
   * @param {Array} deps - dependencies passed to the `useEffect`.
   */
  useBackend(func, deps) {
    const [state, dispatch] = useReducer(backendReducer, {
      submitting: false,
      error: '',
      result: null,
    });

    useEffect(() => {
      (async () => {
        try {
          const result = await func();
          dispatch({type: 'success', result});
        } catch (err) {
          dispatch({type: 'error', error: err.toString()});
          this.store.dispatch(addError(err.message));
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return [state.result, state.submitting, state.error];
  }

  async catchErrors(promise) {
    try {
      return await promise;
    } catch (err) {
      this.store.dispatch(addError(err.toString()));
      return undefined;
    }
  }

  getMe() {
    return this._request(flask`api.me`());
  }

  searchUsers(name, email) {
    return this._request(flask`api.users`({name, email}));
  }

  createNewdle(title, duration, timezone, timeslots, participants, isPrivate, notify) {
    const params = {
      method: 'POST',
      body: JSON.stringify({
        title,
        duration,
        timezone,
        timeslots,
        participants,
        private: isPrivate,
        notify,
      }),
    };
    return this._request(flask`api.create_newdle`(), params);
  }

  updateNewdle(code, attrs) {
    const params = {
      method: 'PATCH',
      body: JSON.stringify(attrs),
    };
    return this._request(flask`api.update_newdle`({code}), params);
  }

  getNewdle(code) {
    return this._request(flask`api.get_newdle`({code}), {anonymous: !this.token});
  }

  getMyNewdles() {
    return this._request(flask`api.get_my_newdles`());
  }

  getNewdlesParticipating() {
    return this._request(flask`api.get_newdles_participating`());
  }

  getBusyTimes(date, tz, uid, newdleCode = null, participantCode = null) {
    if (uid !== null) {
      return this._request(flask`api.get_busy_times`({date, uid, tz}));
    } else {
      return this._request(
        flask`api.get_participant_busy_times`({
          code: newdleCode,
          participant_code: participantCode || 'me',
          date,
          tz,
        }),
        {anonymous: participantCode !== null}
      );
    }
  }

  setFinalDate(code, finalDate) {
    return this.updateNewdle(code, {final_dt: finalDate});
  }

  deleteNewdle(code) {
    return this._request(flask`api.delete_newdle`({code}), {
      method: 'DELETE',
    });
  }

  getParticipants(code) {
    return this._request(flask`api.get_participants`({code}), {anonymous: !this.token});
  }

  getParticipant(newdleCode, participantCode) {
    if (participantCode === null) {
      return this._request(flask`api.get_participant_me`({code: newdleCode}));
    } else {
      const params = {code: newdleCode, participant_code: participantCode};
      return this._request(flask`api.get_participant`(params), {anonymous: true});
    }
  }

  updateParticipantAnswers(newdleCode, participantCode, answers, comment = '') {
    const params = {code: newdleCode, participant_code: participantCode};
    return this._request(flask`api.update_participant`(params), {
      anonymous: true,
      method: 'PATCH',
      body: JSON.stringify({
        answers,
        comment,
      }),
    });
  }

  createParticipant(newdleCode, participantName, anonymous) {
    const params = {code: newdleCode};
    if (anonymous) {
      return this._request(flask`api.create_unknown_participant`(params), {
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

  sendDeletionEmails(code, comment) {
    return this._request(flask`api.send_deletion_emails`({code}), {
      method: 'POST',
      body: JSON.stringify({
        comment: comment,
      }),
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
