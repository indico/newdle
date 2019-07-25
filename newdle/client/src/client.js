import flask from 'flask-urls.macro';
import {getToken, isRefreshingToken} from './selectors';
import {tokenExpired} from './actions';

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
  refreshing = false;

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

  async _request(url, withStatus = false, isRetry = false) {
    const headers = {Accept: 'application/json'};
    const token = this.token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    let resp;
    try {
      resp = await fetch(url, {headers});
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
    if (data.error === 'token_expired' && !isRetry && !this.refreshing) {
      console.log('Token expired; asking user to login again');
      await this._refreshToken();
      if (this.token) {
        console.log('We got a new token; retrying request');
        return await this._request(url, withStatus, true);
      } else {
        console.log('User logged out during refresh; aborting');
      }
    }
    throw new ClientError(url, resp.status, data.error || `Unknown error`, data);
  }

  async _refreshToken() {
    this.refreshing = true;
    // dispatching tokenExpired will show a prompt about the expire session asking
    // the user to login again (or logout)
    this.store.dispatch(tokenExpired());
    let unsubscribe;
    await new Promise(resolve => {
      // subscribe to the store and wait until the refreshing flag we set through
      // the dispatch above has been reset. this happens only after a successful
      // login or logout
      unsubscribe = this.store.subscribe(() => {
        if (!isRefreshingToken(this.store.getState())) {
          console.log('Left refresh mode');
          resolve();
        }
      });
    });
    // once we're here the user has logged in or logged out
    unsubscribe();
    this.refreshing = false;
  }
}

export default new Client();
