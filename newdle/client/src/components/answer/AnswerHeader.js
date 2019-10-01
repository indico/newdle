import React from 'react';
import {Container, Header} from 'semantic-ui-react';
import styles from './AnswerHeader.module.scss';

export default function AnswerHeader() {
  return (
    <Container className={styles['title-container']}>
      <Header as="h1" className={styles.title}>
        Indico meeting
      </Header>
      <div className={styles.author}>by Pedro Ferreira</div>
    </Container>
  );
}
