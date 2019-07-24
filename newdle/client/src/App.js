import React from 'react';
import {Header} from 'semantic-ui-react';

import styles from './App.module.scss';

export default function App() {
  return (
    <main>
      <header className={styles.header}>
        <Header as="h1" className={styles.title}>
          newdle
        </Header>
      </header>
    </main>
  );
}
