import React, {useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Button,
  Container,
  Header,
  Icon,
  Input,
  Loader,
  Message,
  Table,
  Modal,
  Label,
  Checkbox,
} from 'semantic-ui-react';
import ParticipantTable from '../ParticipantTable';
import {
  getMissingParticipants,
  getNewdle,
  newdleHasParticipantsWithEmail,
  newdleHasParticipantsWithoutEmail,
  newdleParticipantsWithEmail,
  newdleParticipantsWithoutEmail,
  getUserInfo,
} from '../../selectors';
import {updateNewdle} from '../../actions';
import client from '../../client';
import {usePageTitle} from '../../util/hooks';
import RecipientList from '../RecipientList';

import styles from './summary.module.scss';

export default function SummaryPage() {
  const [finalDate, setFinalDate] = useState(null);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [sendDeletionMail, setSendDeletionMail] = useState(false);
  const [comment, setComment] = useState('');
  const newdle = useSelector(getNewdle);
  const hasParticipantsWithEmail = useSelector(newdleHasParticipantsWithEmail);
  const hasParticipantsWithoutEmail = useSelector(newdleHasParticipantsWithoutEmail);
  const participantsWithEmail = useSelector(newdleParticipantsWithEmail);
  const participantsWithoutEmail = useSelector(newdleParticipantsWithoutEmail);
  const missingParticipants = useSelector(getMissingParticipants);
  const userInfo = useSelector(getUserInfo);
  const isCreator = userInfo !== null && newdle !== null && userInfo.uid === newdle.creator_uid;
  const dispatch = useDispatch();
  const [_sendResultEmails, mailSending, mailError, sendMailResponse] = client.useBackendLazy(
    client.sendResultEmails
  );
  const [_sendDeletionEmails, deletionMailSending] = client.useBackendLazy(
    client.sendDeletionEmails
  );
  const [_setFinalDate, submitting] = client.useBackendLazy(client.setFinalDate);
  const [_deleteNewdle, deleting] = client.useBackendLazy(client.deleteNewdle);
  usePageTitle(newdle && `Summary: ${newdle.title}`, true);

  const update = async () => {
    const updatedNewdle = await _setFinalDate(newdle.code, finalDate);
    if (updatedNewdle) {
      dispatch(updateNewdle(updatedNewdle));
    }
  };

  const handleMailModalClose = useCallback(() => {
    setMailModalOpen(false);
  }, [setMailModalOpen]);

  const handleMailModalConfirm = useCallback(() => {
    setMailModalOpen(false);
    _sendResultEmails(newdle.code);
  }, [setMailModalOpen, newdle, _sendResultEmails]);

  const handleDeletionModalClose = useCallback(() => {
    setDeletionModalOpen(false);
  }, [setDeletionModalOpen]);

  const handleDeletionModalConfirm = useCallback(async () => {
    if (sendDeletionMail) {
      _sendDeletionEmails(newdle.code, comment.trim());
    }
    const deletedNewdle = await _deleteNewdle(newdle.code);
    if (deletedNewdle) {
      dispatch(updateNewdle(deletedNewdle));
    }
    setDeletionModalOpen(false);
  }, [sendDeletionMail, _deleteNewdle, newdle, _sendDeletionEmails, comment, dispatch]);

  if (!newdle) {
    return <Loader active />;
  }

  if (newdle.deleted) {
    return (
      <Container text>
        <Message>This newdle has been deleted by its creator.</Message>
      </Container>
    );
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
          <Modal onClose={handleMailModalClose} size="small" closeIcon open={mailModalOpen}>
            <Modal.Header>
              <span>E-mail participants </span>
              <Label color="green" size="small" circular>
                {participantsWithEmail.length}
              </Label>
            </Modal.Header>
            <Modal.Content>
              {hasParticipantsWithoutEmail && (
                <div className={styles['email-participant-list']}>
                  Some of your participants do not have e-mail addresses and will not be contacted:
                  <RecipientList recipients={participantsWithoutEmail} color="red" icon="close" />
                </div>
              )}
              <div className={styles['email-participant-list']}>
                {participantsWithEmail.length} participants will be e-mailed:
                <RecipientList recipients={participantsWithEmail} color="green" icon="check" />
              </div>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={handleMailModalConfirm} positive>
                Confirm
              </Button>
              <Button onClick={handleMailModalClose}>Cancel</Button>
            </Modal.Actions>
          </Modal>
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
                      onClick={() => setMailModalOpen(true)}
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
              <Table unstackable>
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
            <>
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
        </>
      )}
      {isCreator && (
        <>
          <div className={styles['button-row']}>
            <Button
              size="small"
              className={styles['delete-button']}
              onClick={() => setDeletionModalOpen(true)}
            >
              Delete this newdle
            </Button>
          </div>
          <Modal onClose={handleDeletionModalClose} size="small" closeIcon open={deletionModalOpen}>
            <Modal.Header>Delete this newdle</Modal.Header>
            <Modal.Content>
              Do you really wish to delete this newdle? Please be aware that{' '}
              <strong>this action cannot be undone.</strong>
              {hasParticipantsWithEmail && (
                <div className={styles['mail-checkbox']}>
                  <Checkbox
                    checked={sendDeletionMail}
                    onChange={() => setSendDeletionMail(!sendDeletionMail)}
                    label="Notify the participants via e-mail"
                  />
                  {sendDeletionMail && (
                    <Input
                      type="text"
                      placeholder="Leave a comment (optional)"
                      className={styles['deletion-comment']}
                      value={comment}
                      onChange={(__, {value}) => setComment(value)}
                    />
                  )}
                  {hasParticipantsWithoutEmail && (
                    <Message className={styles['email-participant-list']}>
                      <strong>
                        Some of your participants do not have e-mail addresses and will not be
                        contacted:
                      </strong>
                      <RecipientList
                        recipients={participantsWithoutEmail}
                        color="red"
                        icon="close"
                      />
                    </Message>
                  )}
                </div>
              )}
            </Modal.Content>
            <Modal.Actions>
              <Button
                negative
                onClick={() => handleDeletionModalConfirm(true)}
                loading={deletionMailSending || deleting}
              >
                Delete newdle
              </Button>
            </Modal.Actions>
          </Modal>
        </>
      )}
    </Container>
  );
}
