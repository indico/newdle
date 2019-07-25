import React from 'react';

import {useSelector} from 'react-redux';
import {Header, Modal} from 'semantic-ui-react';
import UserMenu from './UserMenu';
import {isRefreshingToken} from './selectors';
import {useAuthentication} from './auth';

import styles from './App.module.scss';

export default function App() {
  const refreshing = useSelector(isRefreshingToken);
  const {login, logout} = useAuthentication();

  return (
    <main>
      <header className={styles.header}>
        <Header as="h1" className={styles.title}>
          newdle
        </Header>
        <UserMenu />
      </header>
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
