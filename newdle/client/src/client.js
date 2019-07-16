import flask from 'flask-urls.macro';
import {getToken} from './selectors';

class ClientError extends Error {
  constructor(url, code, message) {
    if (code) {
      super(`Request to ${url} failed (${code}): ${message}`);
    } else {
      super(`Request to ${url} failed: ${message}`);
    }
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

  async _request(url, withStatus = false) {
    const headers = {};
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
    throw new ClientError(url, resp.status, data.error || `Unknown error`);
  }
}

export default new Client();
