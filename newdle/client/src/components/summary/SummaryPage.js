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
  const [finalDate, setFinalDate] = useState(null);
  const newdle = useSelector(getNewdle);
  const dispatch = useDispatch();
  const [_sendResultEmails, mailSending, mailError, sendMailResponse] = client.useBackend(
    client.sendResultEmails
  );
  const [_setFinalDate, submitting, finalDateError] = client.useBackend(client.setFinalDate);

  const update = async () => {
    const updatedNewdle = await _setFinalDate(newdle.code, finalDate);
    if (updatedNewdle) {
      dispatch(updateNewdle(updatedNewdle));
    }
  };

  const sendResultEmails = () => _sendResultEmails(newdle.code);

  if (!newdle) {
    return <Loader active />;
  }

  const mailSent = sendMailResponse !== null;

  return (
    <Container text>
      {newdle.final_dt ? (
        <>
          {mailError && (
            <Message error>
              <p>Something when wrong when notifying participants:</p>
              <code>{mailError}</code>
            </Message>
          )}
          {mailSent && (
            <Message success>
              <p>The participants have been notified of the final date</p>
            </Message>
          )}
          <FinalDate {...newdle} />
          <div className={styles['button-row']}>
            <Button
              icon
              color="blue"
              labelPosition="left"
              disabled={mailSending || mailSent}
              onClick={sendResultEmails}
            >
              <Icon name="mail" />
              E-mail participants
            </Button>
            <Button className={styles['create-event-button']}>Create event</Button>
          </div>
        </>
      ) : (
        <>
          {finalDateError && (
            <Message error>
              <p>Something when wrong when updating your newdle:</p>
              <code>{finalDateError}</code>
            </Message>
          )}
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
    </Container>
  );
}
