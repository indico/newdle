import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {Button, Container, Header, Input, Message} from 'semantic-ui-react';
import {
  getDuration,
  getFullTimeslots,
  getParticipantData,
  getTimezone,
  getTitle,
} from '../../selectors';
import client from '../../client';
import {newdleCreated, setStep, setTitle} from '../../actions';
import styles from './creation.module.scss';

const MAX_INPUT_LENGTH = 80;

export default function FinalStep() {
  const title = useSelector(getTitle);
  const duration = useSelector(getDuration);
  const timeslots = useSelector(getFullTimeslots);
  const participants = useSelector(getParticipantData);
  const timezone = useSelector(getTimezone);
  const dispatch = useDispatch();
  const history = useHistory();
  const [_createNewdle, submitting, error] = client.useBackend(client.createNewdle);

  async function createNewdle() {
    const newdle = await _createNewdle(title, duration, timezone, timeslots, participants);
    dispatch(newdleCreated(newdle));
    history.push('/new/success');
  }

  const canSubmit = title.length >= 3 && !submitting;

  return (
    <Container text>
      <Input
        autoFocus
        transparent
        className={styles['title-input']}
        placeholder="Please enter a title for your event..."
        value={title}
        disabled={submitting}
        maxLength={MAX_INPUT_LENGTH}
        onChange={(_, data) => dispatch(setTitle(data.value))}
        onKeyDown={e => {
          if (e.key === 'Enter' && canSubmit) {
            createNewdle();
          }
        }}
      />
      <div className={styles['attention-message']}>
        <Header as="h3" className={styles['header']}>
          Attention
        </Header>
        {participants.length !== 0 ? (
          <p>
            Your participants will receive an e-mail asking them to register to their preference.
            Once the newdle is created, you will be shown a link you can share with anyone else you
            wish to invite.
          </p>
        ) : (
          <p>
            Once the newdle is created, you will be shown a link which you need to send to anyone
            you wish to invite.
          </p>
        )}
      </div>
      {error && (
        <Message error>
          <p>Something when wrong while creating your newdle:</p>
          <code>{error}</code>
        </Message>
      )}
      <div className={styles['create-button']}>
        <Button
          color="violet"
          type="submit"
          disabled={!canSubmit}
          onClick={createNewdle}
          loading={submitting}
        >
          Create your Newdle!{' '}
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
          content="Change participants"
        />
        <Button
          size="small"
          color="violet"
          basic
          onClick={() => dispatch(setStep(2))}
          disabled={submitting}
          icon="angle left"
          content="Change time slots"
        />
      </div>
    </Container>
  );
}
