import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Header} from 'semantic-ui-react';
import {abortAnswering, fetchNewdleForAnswer, fetchBusyTimesForAnswer} from '../../actions';
import {getNewdle, getNewdleTimeslots} from '../../answerSelectors';
import {serializeDate, toMoment} from '../../util/date';
import moment from 'moment';
import styles from './AnswerHeader.module.scss';

export default function AnswerHeader({match}) {
  const code = match.params.code;
  const newdle = useSelector(getNewdle);
  const newdleTimeslots = useSelector(getNewdleTimeslots);
  const dates = newdleTimeslots.map(slot =>
    serializeDate(toMoment(slot, moment.HTML5_FMT.DATETIME_LOCAL))
  );
  const email = 'random@email.cern.ch';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdleForAnswer(code));

    return () => {
      dispatch(abortAnswering());
    };
  }, [code, dispatch]);

  useEffect(() => {
    dispatch(fetchBusyTimesForAnswer(email, dates));
  }, [dates, email, dispatch]);

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
