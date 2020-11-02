import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {t, Trans} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Checkbox, Input, Message, Modal} from 'semantic-ui-react';
import {updateNewdle} from '../../actions';
import client from '../../client';
import {
  getNewdle,
  newdleHasParticipantsWithEmail,
  newdleHasParticipantsWithoutEmail,
  newdleParticipantsWithoutEmail,
} from '../../selectors';
import Button from '../common/Button';
import RecipientList from '../RecipientList';
import styles from './summary.module.scss';

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
          <strong>this action cannot be undone</strong>.
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
            {hasParticipantsWithoutEmail && sendDeletionMail && (
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
