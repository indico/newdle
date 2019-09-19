import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Container} from 'semantic-ui-react';
import ParticipantTable from './ParticipantTable';
import {clearFinalDate} from '../actions';
import {getNewdle, getFinalDate} from '../selectors';
import client from '../client';
import styles from './Summary.module.scss';

export default function Summary() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const newdle = useSelector(getNewdle);
  const finalDate = useSelector(getFinalDate);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearFinalDate());
    };
  }, [dispatch]);

  async function updateNewdle() {
    setError('');
    setSubmitting(true);
    let newdle;
    try {
      newdle = await client.updateNewdle(newdle.code, {final_dt: finalDate});
    } catch (exc) {
      setSubmitting(false);
      setError(exc.toString());
      return;
    }
    setSubmitting(false);
  }

  return (
    <>
      {newdle && (
        <Container text>
          <ParticipantTable />
          <div className={styles['button-row']}>
            <Button
              type="submit"
              loading={submitting}
              disabled={!finalDate}
              className={styles['finalize-button']}
              onClick={updateNewdle}
            >
              Select final date
            </Button>
          </div>
        </Container>
      )}
    </>
  );
}
