import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useAuthentication} from './auth';
import {getUserInfo, isLoggedIn} from './selectors';
import {loadUser} from './actions';

export default function AuthTest() {
  const user = useSelector(getUserInfo);
  const dispatch = useDispatch();
  const loggedIn = useSelector(isLoggedIn);
  const {login, logout} = useAuthentication();

  const handleRefreshClick = () => {
    dispatch(loadUser());
  };

  return (
    <div>
      <button onClick={handleRefreshClick}>Refresh user info</button>
      <hr />
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <hr />
      {loggedIn ? <button onClick={logout}>Logout</button> : <button onClick={login}>Login</button>}
    </div>
  );
}
