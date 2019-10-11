import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Header} from 'semantic-ui-react';
import {abortAnswering, fetchNewdleForAnswer} from '../../actions';
import {getNewdle} from '../../answerSelectors';
import styles from './AnswerHeader.module.scss';

export default function AnswerHeader({match}) {
  const code = match.params.code;
  const newdle = useSelector(getNewdle);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdleForAnswer(code));

    return () => {
      dispatch(abortAnswering());
    };
  }, [code, dispatch]);

  if (!newdle) {
    return null;
  }

  return (
    <Container className={styles['title-container']}>
      <Header as="h1" className={styles.title}>
        {newdle.title}
      </Header>
      <div className={styles.author}>by {newdle.creator_name}</div>
    </Container>
  );
}
