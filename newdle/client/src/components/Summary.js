import React, {useState} from 'react';
import {serializeDate, toMoment} from '../util/date';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Container, Icon, Loader} from 'semantic-ui-react';
import ParticipantTable from './ParticipantTable';
import {getNewdle} from '../selectors';
import {updateNewdle} from '../actions';
import client from '../client';
import styles from './Summary.module.scss';

export default function Summary() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [finalDate, setFinalDate] = useState(null);
  const newdle = useSelector(getNewdle);
  const dispatch = useDispatch();

  const update = async () => {
    setError('');
    setSubmitting(true);
    let updatedNewdle;
    try {
      updatedNewdle = await client.setFinalDate(newdle.code, finalDate);
    } catch (exc) {
      setSubmitting(false);
      setError(exc.toString());
      return;
    }
    dispatch(updateNewdle(updatedNewdle));
    setSubmitting(false);
  };

  if (!newdle) {
    return <Loader />;
  }

  return (
    <Container text>
      {!newdle.final_dt && (
        <>
          <ParticipantTable finalDate={finalDate} setFinalDate={setFinalDate} />
          <div className={styles['button-row']}>
            <Button
              type="submit"
              loading={submitting}
              disabled={!finalDate}
              className={styles['finalize-button']}
              onClick={update}
            >
              Select final date
            </Button>
          </div>
        </>
      )}
      {newdle.final_dt && (
        <>
          <div className={styles['summary-container']}>
            <div className={styles['datetime']}>
              <Icon name="calendar alternate outline" />
              {serializeDate(newdle.final_dt, 'MMMM Do YYYY')}
            </div>
            <div className={styles['datetime']}>
              <Icon name="clock outline" />
              {serializeDate(newdle.final_dt, 'h:mm')} -{' '}
              {serializeDate(toMoment(newdle.final_dt).add(newdle.duration, 'm'), 'h:mm')} (
              {newdle.timezone})
            </div>
          </div>
          <div className={styles['button-row']}>
            <Button className={styles['create-event-button']}>Create event</Button>
          </div>
        </>
      )}
    </Container>
  );
}
