import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Header, Modal} from 'semantic-ui-react';
import AuthTest from './AuthTest';
import {getUserInfo, isRefreshingToken} from './selectors';
import {loadUser} from './actions';
import {useAuthentication} from './auth';
import styles from './App.module.scss';

export default function App() {
  const user = useSelector(getUserInfo);
  const refreshing = useSelector(isRefreshingToken);
  const {login, logout} = useAuthentication();
  const dispatch = useDispatch();

  const handleWhoamiClick = async () => {
    await new Promise(r => setTimeout(r, 250));
    dispatch(loadUser());
  };

  return (
    <main>
      <header className={styles.header}>
        <Header as="h1" className={styles.title}>
          newdle
        </Header>
      </header>
      <div>
        <button onClick={handleWhoamiClick}>Refresh user info</button>
        <hr />
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <hr />
        <AuthTest />
      </div>
      {refreshing && (
        <Modal
          open
          size="mini"
          header="Your session expired"
          content="Please log in again to confirm your identity"
          actions={[
            {key: 'login', content: 'Login', positive: true, onClick: login},
            {key: 'logout', content: 'Logout', onClick: logout},
          ]}
        />
      )}
    </main>
  );
}
