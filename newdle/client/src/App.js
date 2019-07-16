import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Header} from 'semantic-ui-react';
import AuthTest from './AuthTest';
import {getUserInfo} from './selectors';
import {loadUser} from './actions';

import styles from './App.module.scss';

export default function App() {
  const user = useSelector(getUserInfo);
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
    </main>
  );
}
