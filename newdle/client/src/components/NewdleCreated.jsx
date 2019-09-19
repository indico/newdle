import React from 'react';
import {Button, Container, Header} from 'semantic-ui-react';
import {useSelector} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {getCreatedNewdle} from '../selectors';
import styles from './NewdleCreated.module.scss';

export default function NewdleCreated() {
  const newdle = useSelector(getCreatedNewdle);

  if (!newdle) {
    return <Redirect to="/new" />;
  }

  return (
    <Container text>
      <Header as="h1" className={styles['newdle-title']}>
        {newdle.title}
      </Header>
      <div className={styles['success-message']}>
        <Header as="h3" className={styles['header']}>
          Done!
        </Header>
        <p>
          Your Newdle was created and invite e-mails have been sent. You can send the following link
          to everyone you would like to invite:
        </p>
        <div className={styles['newdle-link']}>{newdle.url}</div>
      </div>
      <div className={styles['summary-button']}>
        <Button color="teal">Go to Newdle summary!</Button>
      </div>
    </Container>
  );
}
