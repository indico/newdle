import React from 'react';
import {useSelector} from 'react-redux';
import {useAuthentication} from './auth';
import {isLoggedIn} from './selectors';

export default function AuthTest() {
  const loggedIn = useSelector(isLoggedIn);
  const {login, logout} = useAuthentication();

  return loggedIn ? (
    <button onClick={logout}>Logout</button>
  ) : (
    <button onClick={login}>Login</button>
  );
}
