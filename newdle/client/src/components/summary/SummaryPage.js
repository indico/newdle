import React, {useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {Trans, Plural, t} from '@lingui/macro';
import PropTypes from 'prop-types';
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
  Dropdown,
  Checkbox,
} from 'semantic-ui-react';
import {updateNewdle} from '../../actions';
import client from '../../client';
import {
  getMissingParticipants,
  getNewdle,
  newdleHasParticipantsWithEmail,
  newdleHasParticipantsWithoutEmail,
  newdleParticipantsWithEmail,
  newdleParticipantsWithoutEmail,
  getUserInfo,
} from '../../selectors';
import {usePageTitle} from '../../util/hooks';
import ParticipantTable from '../ParticipantTable';
import RecipientList from '../RecipientList';
import styles from './summary.module.scss';

export default function SummaryPage() {
  const [finalDate, setFinalDate] = useState(null);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
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
  const [_setFinalDate, submitting] = client.useBackendLazy(client.setFinalDate);
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

  if (!newdle) {
    return <Loader active />;
  }

  if (newdle.deleted) {
    return (
      <Container text>
        <Message>
          <Trans>This newdle has been deleted by its creator.</Trans>
        </Message>
      </Container>
    );
  }

  const mailSent = sendMailResponse !== null;
  const editUrl = `/newdle/${newdle.code}/edit`;

  return (
    <Container text>
      {newdle.final_dt ? (
        <>
          {mailError && (
            <Message error>
              <p>
                <Trans>Something went wrong when notifying participants:</Trans>
              </p>
              <code>{mailError}</code>
            </Message>
          )}
          {mailSent && (
            <Message success>
              <p>
                <Trans>The participants have been notified of the final date.</Trans>
              </p>
              {hasParticipantsWithoutEmail && (
                <p>
                  <Trans>
                    Note that some of your participants did not provide an email address and thus
                    could not be notified!
                  </Trans>
                </p>
              )}
            </Message>
          )}
          <Modal onClose={handleMailModalClose} size="small" closeIcon open={mailModalOpen}>
            <Modal.Header>
              <span>
                <Trans>E-mail participants</Trans>
              </span>
              <Label color="green" size="small" circular>
                {participantsWithEmail.length}
              </Label>
            </Modal.Header>
            <Modal.Content>
              {hasParticipantsWithoutEmail && (
                <div className={styles['email-participant-list']}>
                  <Trans>
                    Some of your participants do not have e-mail addresses and will not be
                    contacted:
                  </Trans>
                  <RecipientList recipients={participantsWithoutEmail} color="red" icon="close" />
                </div>
              )}
              <div className={styles['email-participant-list']}>
                <Plural
                  value={participantsWithEmail.length}
                  one="# participant will be e-mailed:"
                  other="# participants will be e-mailed:"
                />
                <RecipientList recipients={participantsWithEmail} color="green" icon="check" />
              </div>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={handleMailModalConfirm} positive>
                <Trans>Confirm</Trans>
              </Button>
              <Button onClick={handleMailModalClose}>
                <Trans>Cancel</Trans>
              </Button>
            </Modal.Actions>
          </Modal>
          <div className={styles.container}>
            <Header className={styles.header} as="h2">
              <Trans>{newdle.title} will take place on:</Trans>
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
                      <Trans>E-mail participants</Trans>
                    </Button>
                  )}
                  <Button className={styles['create-event-button']}>
                    <Trans>Create event</Trans>
                  </Button>
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
                        <strong>
                          <Trans>The following participants have not voted yet:</Trans>
                        </strong>
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
                <Trans>Select final date</Trans>
              </Button>
              <Dropdown
                text={t`Edit`}
                floating
                button
                direction="right"
                color="violet"
                as={Button}
                className={styles['edit-button']}
              >
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} text={t`Participants`} to={`${editUrl}/participants`} />
                  <Dropdown.Item as={Link} text={t`Timeslots`} to={editUrl} />
                  <Dropdown.Item as={Link} text={t`Options`} to={`${editUrl}/options`} />
                  <Dropdown.Item
                    text={t`Delete newdle`}
                    onClick={() => setDeletionModalOpen(true)}
                  />
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
          <DeleteModal open={deletionModalOpen} setOpen={setDeletionModalOpen} />
        </>
      )}
    </Container>
  );
}

export function DeleteModal({open, setOpen}) {
  const [sendDeletionMail, setSendDeletionMail] = useState(false);
  const [comment, setComment] = useState('');
  const newdle = useSelector(getNewdle);
  const hasParticipantsWithEmail = useSelector(newdleHasParticipantsWithEmail);
  const hasParticipantsWithoutEmail = useSelector(newdleHasParticipantsWithoutEmail);
  const participantsWithoutEmail = useSelector(newdleParticipantsWithoutEmail);
  const dispatch = useDispatch();
  const [_deleteNewdle, deleting] = client.useBackendLazy(client.deleteNewdle);
  const [_sendDeletionEmails, deletionMailSending] = client.useBackendLazy(
    client.sendDeletionEmails
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleConfirm = useCallback(async () => {
    if (sendDeletionMail) {
      _sendDeletionEmails(newdle.code, comment.trim());
    }
    const deletedNewdle = await _deleteNewdle(newdle.code);
    if (deletedNewdle) {
      dispatch(updateNewdle(deletedNewdle));
    }
    setOpen(false);
  }, [
    _deleteNewdle,
    _sendDeletionEmails,
    comment,
    dispatch,
    newdle.code,
    sendDeletionMail,
    setOpen,
  ]);

  return (
    <Modal onClose={handleClose} size="small" closeIcon open={open}>
      <Modal.Header>
        <Trans>Delete this newdle</Trans>
      </Modal.Header>
      <Modal.Content>
        <Trans>
          Do you really wish to delete this newdle? Please be aware that{' '}
          <strong>this action cannot be undone.</strong>
        </Trans>
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
                placeholder={t`Leave a comment (optional)`}
                className={styles['deletion-comment']}
                value={comment}
                onChange={(__, {value}) => setComment(value)}
              />
            )}
            {hasParticipantsWithoutEmail && (
              <Message className={styles['email-participant-list']}>
                <strong>
                  <Trans>
                    Some of your participants do not have e-mail addresses and will not be
                    contacted:
                  </Trans>
                </strong>
                <RecipientList recipients={participantsWithoutEmail} color="red" icon="close" />
              </Message>
            )}
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={handleConfirm} loading={deletionMailSending || deleting}>
          <Trans>Delete newdle</Trans>
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

DeleteModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};
