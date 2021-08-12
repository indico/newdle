import React, {useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {Trans, Plural, t} from '@lingui/macro';
import {
  Button,
  Container,
  Header,
  Icon,
  Loader,
  Message,
  Table,
  Modal,
  Label,
  Dropdown,
} from 'semantic-ui-react';
import {getGridViewActive} from 'src/answerSelectors';
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
import ParticipantGrid from '../ParticipantGrid';
import ParticipantTable from '../ParticipantTable';
import RecipientList from '../RecipientList';
import {DeleteModal} from './DeleteModal';
import styles from './summary.module.scss';

export default function SummaryPage() {
  const [finalDate, setFinalDate] = useState(null);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const gridViewActive = useSelector(getGridViewActive);
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
  const [_createEvent] = client.useBackendLazy(client.createEvent);
  const [config, loading] = client.useBackend(() => client.getConfig(), []);
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

  if (!newdle || !config) {
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

  const createEvent = async (event, {value}) => {
    const resp = await _createEvent(newdle.code);
    if (resp && resp.url) {
      window.location.href = resp.url;
    }
  };

  const actions = (
    <>
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
      {config.has_event_creation && (
        <Button className={styles['create-event-button']} onClick={createEvent} loading={loading}>
          <Trans>Create event</Trans>
        </Button>
      )}
    </>
  );

  return (
    <div style={{paddingTop: '0'}}>
      {newdle.final_dt ? (
        <>
          {mailError && (
            <div className={styles.container}>
              <Message error>
                <p>
                  <Trans>Something went wrong when notifying participants:</Trans>
                </p>
                <code>{mailError}</code>
              </Message>
            </div>
          )}
          {mailSent && (
            <div className={styles.container}>
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
            </div>
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
          </div>
          {gridViewActive ? (
            <ParticipantGrid
              finalDate={newdle.final_dt}
              setFinalDate={setFinalDate}
              isCreator={isCreator}
              finalized
            />
          ) : (
            <ParticipantTable
              finalDate={newdle.final_dt}
              setFinalDate={setFinalDate}
              isCreator={isCreator}
              finalized
            >
              {isCreator && <div className={styles['button-row']}>{actions}</div>}
            </ParticipantTable>
          )}
          {isCreator && (
            <div className={styles['button-row']}>
              {gridViewActive && actions}
              <Button
                color="red"
                className={styles['delete-button']}
                onClick={() => setDeletionModalOpen(true)}
              >
                <Trans>Delete newdle</Trans>
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {gridViewActive ? (
            <ParticipantGrid
              finalDate={finalDate}
              setFinalDate={setFinalDate}
              finalized={false}
              isCreator={isCreator}
            />
          ) : (
            <ParticipantTable
              finalDate={finalDate}
              setFinalDate={setFinalDate}
              finalized={false}
              isCreator={isCreator}
            />
          )}
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
        </>
      )}
      <DeleteModal open={deletionModalOpen} setOpen={setDeletionModalOpen} />
    </div>
  );
}
