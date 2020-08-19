import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Container, Header, Icon, Loader, Message, Table} from 'semantic-ui-react';
import ParticipantTable from '../ParticipantTable';
import {
  getMissingParticipants,
  getNewdle,
  newdleHasParticipantsWithEmail,
  newdleHasParticipantsWithoutEmail,
  getUserInfo,
} from '../../selectors';
import {updateNewdle} from '../../actions';
import client from '../../client';
import {usePageTitle} from '../../util/hooks';
import styles from './summary.module.scss';

export default function SummaryPage() {
  const [finalDate, setFinalDate] = useState(null);
  const newdle = useSelector(getNewdle);
  const hasParticipantsWithEmail = useSelector(newdleHasParticipantsWithEmail);
  const hasParticipantsWithoutEmail = useSelector(newdleHasParticipantsWithoutEmail);
  const missingParticipants = useSelector(getMissingParticipants);
  const userInfo = useSelector(getUserInfo);
  const isCreator = userInfo !== null && newdle !== null && userInfo.uid === newdle.creator_uid;
  const dispatch = useDispatch();
  const [_sendResultEmails, mailSending, mailError, sendMailResponse] = client.useBackendLazy(
    client.sendResultEmails
  );
  const [_setFinalDate, submitting] = client.useBackendLazy(client.setFinalDate);
  usePageTitle(newdle && `Summary: ${newdle.title}`, true);

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
          <div className={styles.container}>
            <Header className={styles.header} as="h2">
              {newdle.title} will take place on:
            </Header>
            <ParticipantTable
              finalDate={newdle.final_dt}
              setFinalDate={setFinalDate}
              isCreator={isCreator}
              finalized
            >
              {isCreator && (
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
              )}
            </ParticipantTable>
          </div>
        </>
      ) : (
        <>
          <ParticipantTable
            finalDate={finalDate}
            setFinalDate={setFinalDate}
            finalized={false}
            isCreator={isCreator}
          />
          {!!missingParticipants.length && (
            <div className={styles['missing-participants']}>
              <Table>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell width={3} textAlign="center">
                      <Icon name="question" color="grey" size="big" circular />
                    </Table.Cell>
                    <Table.Cell width={10} textAlign="left">
                      <div>
                        <strong>The following participants have not voted yet:</strong>
                      </div>
                      {missingParticipants.map(part => part.name).join(', ')}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </div>
          )}
          {isCreator && (
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
          )}
        </>
      )}
    </Container>
  );
}
