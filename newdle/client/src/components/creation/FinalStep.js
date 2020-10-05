import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {t, Trans} from '@lingui/macro';
import {Button, Container, Header, Icon, Input, Checkbox} from 'semantic-ui-react';
import {newdleCreated, setStep, setTitle, setPrivate, setNotification} from '../../actions';
import client from '../../client';
import {
  getDuration,
  getFullTimeslots,
  getParticipantData,
  getTimezone,
  getTitle,
  getPrivacySetting,
  getNotifySetting,
} from '../../selectors';
import styles from './creation.module.scss';

export default function FinalStep() {
  const title = useSelector(getTitle);
  const isPrivate = useSelector(getPrivacySetting);
  const notify = useSelector(getNotifySetting);
  const duration = useSelector(getDuration);
  const timeslots = useSelector(getFullTimeslots);
  const participants = useSelector(getParticipantData);
  const timezone = useSelector(getTimezone);
  const dispatch = useDispatch();
  const history = useHistory();
  const [_createNewdle, submitting] = client.useBackendLazy(client.createNewdle);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  async function createNewdle() {
    const newdle = await _createNewdle(
      title,
      duration,
      timezone,
      timeslots,
      participants,
      isPrivate,
      notify
    );

    if (newdle) {
      dispatch(newdleCreated(newdle));
      history.push('/new/success');
    }
  }

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
      <div className={styles['attention-message']}>
        <Header as="h3" className={styles['header']}>
          <Trans>Attention</Trans>
        </Header>
        {participants.length !== 0 ? (
          <p>
            <Trans>
              Your participants will receive an e-mail asking them to register to their preference.
              Once the newdle is created, you will be shown a link you can share with anyone else
              you wish to invite.
            </Trans>
          </p>
        ) : (
          <p>
            <Trans>
              Once the newdle is created, you will be shown a link which you need to send to anyone
              you wish to invite.
            </Trans>
          </p>
        )}
      </div>
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
          onClick={createNewdle}
          loading={submitting}
        >
          <Trans>Create your newdle!</Trans>{' '}
          <span role="img" aria-label="Newdle">
            🍜
          </span>
        </Button>
      </div>
      <div className={styles['link-row']}>
        <Button
          size="small"
          color="violet"
          basic
          onClick={() => dispatch(setStep(1))}
          disabled={submitting}
          icon="angle double left"
          content={t`Change participants`}
        />
        <Button
          size="small"
          color="violet"
          basic
          onClick={() => dispatch(setStep(2))}
          disabled={submitting}
          icon="angle left"
          content={t`Change time slots`}
        />
      </div>
    </Container>
  );
}
