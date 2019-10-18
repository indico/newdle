import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Container, Icon, Loader, Message} from 'semantic-ui-react';
import ParticipantTable from '../ParticipantTable';
import {
  getNewdle,
  newdleHasParticipantsWithEmail,
  newdleHasParticipantsWithoutEmail,
} from '../../selectors';
import {updateNewdle} from '../../actions';
import client from '../../client';
import FinalDate from '../common/FinalDate';
import styles from './summary.module.scss';

export default function SummaryPage() {
  const [finalDate, setFinalDate] = useState(null);
  const newdle = useSelector(getNewdle);
  const hasParticipantsWithEmail = useSelector(newdleHasParticipantsWithEmail);
  const hasParticipantsWithoutEmail = useSelector(newdleHasParticipantsWithoutEmail);
  const dispatch = useDispatch();
  const [_sendResultEmails, mailSending, mailError, sendMailResponse] = client.useBackendLazy(
    client.sendResultEmails
  );
  const [_setFinalDate, submitting] = client.useBackendLazy(client.setFinalDate);

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
              {hasParticipantsWithoutEmail && (
                <p>
                  Note that some of your participants did not provide an email address and thus
                  could not be notified!
                </p>
              )}
            </Message>
          )}
          <FinalDate {...newdle} />
          <div className={styles['button-row']}>
            {hasParticipantsWithEmail && (
              <Button
                icon
                color="blue"
                labelPosition="left"
                loading={mailSending}
                disabled={mailSending || mailSent}
                onClick={sendResultEmails}
              >
                <Icon name="mail" />
                E-mail participants
              </Button>
            )}
            <Button className={styles['create-event-button']}>Create event</Button>
          </div>
        </>
      ) : (
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
    </Container>
  );
}
