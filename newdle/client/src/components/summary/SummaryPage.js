import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Container, Icon, Loader, Message} from 'semantic-ui-react';
import ParticipantTable from '../ParticipantTable';
import {getNewdle} from '../../selectors';
import {updateNewdle} from '../../actions';
import client from '../../client';
import FinalDate from '../common/FinalDate';
import styles from './summary.module.scss';

export default function SummaryPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mailSending, setMailSending] = useState(false);
  const [mailSent, setMailSent] = useState(false);
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

  const sendSummaryEmails = async () => {
    setError('');
    setMailSending(true);
    try {
      await client.sendSummaryEmails(newdle.code);
    } catch (exc) {
      setMailSending(false);
      setError(exc.toString());
      return;
    }
    setMailSending(false);
    setMailSent(true);
  };

  if (!newdle) {
    return <Loader active />;
  }

  return (
    <Container text>
      {newdle.final_dt ? (
        <>
          {mailSent && (
            <Message success>
              <p>Summary mails have been sent to participants</p>
            </Message>
          )}
          <FinalDate {...newdle} />
          <div className={styles['button-row']}>
            <Button
              icon
              color="blue"
              labelPosition="left"
              disabled={mailSending || mailSent}
              onClick={() => {
                sendSummaryEmails();
              }}
            >
              <Icon name="mail" />
              E-mail participants
            </Button>
            <Button className={styles['create-event-button']}>Create event</Button>
          </div>
        </>
      ) : (
        <>
          <ParticipantTable finalDate={finalDate} setFinalDate={setFinalDate} />
          {error && (
            <Message error>
              <p>Something when wrong when updating your newdle:</p>
              <code>{error}</code>
            </Message>
          )}
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
    </Container>
  );
}
