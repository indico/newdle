import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {t, Trans} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Button, Container, Header, Icon, Input, Checkbox} from 'semantic-ui-react';
import {
  newdleCreated,
  setStep,
  setTitle,
  setPrivate,
  setNotification,
  setLimitedSlots,
  updateNewdle,
} from '../../actions';
import client from '../../client';
import {
  getDuration,
  getFullTimeslots,
  getTimezone,
  getTitle,
  getPrivacySetting,
  getNotifySetting,
  getLimitedSlotsSetting,
  getCreatedNewdle,
  getParticipants,
} from '../../selectors';
import {STEPS} from './steps';
import styles from './creation.module.scss';

export default function FinalStep({isEditing}) {
  const title = useSelector(getTitle);
  const isPrivate = useSelector(getPrivacySetting);
  const notify = useSelector(getNotifySetting);
  const limitedSlots = useSelector(getLimitedSlotsSetting);
  const duration = useSelector(getDuration);
  const timeslots = useSelector(getFullTimeslots);
  const participants = useSelector(getParticipants);
  const timezone = useSelector(getTimezone);
  const activeNewdle = useSelector(getCreatedNewdle);
  const dispatch = useDispatch();
  const history = useHistory();
  const [_createNewdle, createSubmitting] = client.useBackendLazy(client.createNewdle);
  const [_editNewdle, editSubmitting] = client.useBackendLazy(client.updateNewdle);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(isEditing);

  async function createNewdle() {
    // When cloning a newdle, participants that answered via the link
    // will not have any identifying information that we can use to clone them
    const participantsWithEmail = participants.filter(p => p.email !== null);

    const newdle = await _createNewdle(
      title,
      duration,
      timezone,
      timeslots,
      participantsWithEmail,
      isPrivate,
      limitedSlots,
      notify
    );

    if (newdle) {
      dispatch(newdleCreated(newdle));
      history.push('/new/success');
    }
  }

  async function editNewdle() {
    const newdle = await _editNewdle(activeNewdle.code, {title, private: isPrivate, notify});

    if (newdle) {
      dispatch(updateNewdle(newdle));
      history.push(`/newdle/${newdle.code}/summary`);
    }
  }

  const submitting = createSubmitting || editSubmitting;
  const canSubmit = title.trim().length >= 3 && !submitting;

  return (
    <Container text>
      <Input
        autoFocus
        transparent
        className={styles['title-input']}
        placeholder={t`Please enter a title for your event...`}
        value={title}
        disabled={submitting}
        maxLength={80}
        onChange={(_, data) => dispatch(setTitle(data.value))}
        onKeyDown={e => {
          if (e.key === 'Enter' && canSubmit) {
            createNewdle();
          }
        }}
      />
      {!isEditing && (
        <div className={styles['attention-message']}>
          <Header as="h3" className={styles['header']}>
            <Trans>Attention</Trans>
          </Header>
          <p>
            {participants.length !== 0 ? (
              <Trans>
                Your participants will receive an e-mail asking them to register to their
                preference. Once the newdle is created, you will be shown a link you can share with
                anyone else you wish to invite.
              </Trans>
            ) : (
              <Trans>
                Once the newdle is created, you will be shown a link which you need to send to
                anyone you wish to invite.
              </Trans>
            )}
          </p>
        </div>
      )}
      <div className={styles['advanced-options']}>
        <div
          className={styles['headerbar']}
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          <Header as="h3" className={styles['header']}>
            <Trans>Advanced options</Trans>
          </Header>
          <Icon name={showAdvancedOptions ? 'chevron up' : 'chevron down'} />
        </div>
        {showAdvancedOptions && (
          <div className={styles['options']}>
            <div>
              <label htmlFor="togglePrivate">
                <Trans>Keep list of participants private</Trans>
              </label>
              <Checkbox
                className={styles['advanced-checkbox']}
                id="togglePrivate"
                toggle
                checked={isPrivate}
                disabled={submitting}
                onChange={(_, {checked}) => dispatch(setPrivate(checked))}
              />
            </div>
            {!isEditing && (
              // This setting cannot be edited after the newdle is created since
              // there could already be multiple answers
              <div>
                <label htmlFor="toggleLimitedSlots">
                  <Trans>One slot per participant</Trans>
                </label>
                <Checkbox
                  className={styles['advanced-checkbox']}
                  id="toggleLimitedSlots"
                  toggle
                  checked={limitedSlots}
                  disabled={submitting}
                  onChange={(_, {checked}) => dispatch(setLimitedSlots(checked))}
                />
              </div>
            )}
            <div>
              <label htmlFor="toggleNotify">
                <Trans>Notify me about new answers</Trans>
              </label>
              <Checkbox
                className={styles['advanced-checkbox']}
                id="toggleNotify"
                toggle
                checked={notify}
                disabled={submitting}
                onChange={(_, {checked}) => dispatch(setNotification(checked))}
              />
            </div>
          </div>
        )}
      </div>
      <div className={styles['create-button']}>
        <Button
          color="violet"
          type="submit"
          disabled={!canSubmit}
          onClick={isEditing ? editNewdle : createNewdle}
          loading={submitting}
        >
          {!isEditing ? (
            <>
              <Trans>Create your newdle!</Trans> 🍜
            </>
          ) : (
            <Trans>Confirm changes</Trans>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div className={styles['link-row']}>
          <Button
            size="small"
            color="violet"
            basic
            onClick={() => dispatch(setStep(STEPS.PARTICIPANTS))}
            disabled={submitting}
            icon="angle double left"
            content={t`Change participants`}
          />
          <Button
            size="small"
            color="violet"
            basic
            onClick={() => dispatch(setStep(STEPS.TIMESLOTS))}
            disabled={submitting}
            icon="angle left"
            content={t`Change time slots`}
          />
        </div>
      )}
    </Container>
  );
}

FinalStep.propTypes = {
  isEditing: PropTypes.bool,
};

FinalStep.defaultProps = {
  isEditing: false,
};
