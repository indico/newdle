import flask from 'flask-urls.macro';
import {getToken, isAcquiringToken} from './selectors';
import {tokenExpired, tokenNeeded} from './actions';

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

  getBusyTimes(date, email) {
    return this._request(flask`api.get_busy_times`({date, email}));
  }

  getParticipant(newdleCode, participantCode) {
    const params = {code: newdleCode, participant_code: participantCode};
    return this._request(flask`api.get_participant`(params), {anonymous: true});
  }

  saveParticipantAvailability(newdleCode, participantCode, availability) {
    const params = {code: newdleCode, participant_code: participantCode};
    return this._request(flask`api.get_participant`(params), {
      anonymous: true,
      method: 'PATCH',
      body: JSON.stringify({
        answers: availability,
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
      data = await resp.json();
    } catch (err) {
      throw new ClientError(url, resp.status, `Received invalid response (${err})`);
    }
    if (resp.ok) {
      return withStatus ? {data, status: resp.status} : data;
    }
    if (data.error === 'token_expired' && !isRetry) {
      console.log('Request failed due to expired token');
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
