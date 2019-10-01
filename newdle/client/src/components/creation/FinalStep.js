import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {Button, Container, Header, Input, Message} from 'semantic-ui-react';
import {
  getDuration,
  getFullTimeslots,
  getParticipantNames,
  getTimezone,
  getTitle,
} from '../../selectors';
import client from '../../client';
import {newdleCreated, setStep, setTitle} from '../../actions';
import styles from './creation.module.scss';

export default function FinalStep() {
  const title = useSelector(getTitle);
  const duration = useSelector(getDuration);
  const timeslots = useSelector(getFullTimeslots);
  const participants = useSelector(getParticipantNames);
  const timezone = useSelector(getTimezone);
  const dispatch = useDispatch();
  const history = useHistory();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function createNewdle() {
    setError('');
    setSubmitting(true);
    let newdle;
    try {
      newdle = await client.createNewdle(title, duration, timezone, timeslots, participants);
    } catch (exc) {
      setSubmitting(false);
      setError(exc.toString());
      return;
    }
    setSubmitting(false);
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
        <p>
          Your participants will receive an e-mail asking them to register to their preference. Once
          the Newdle is created, you will be shown a link you can share with anyone else you wish to
          invite.
        </p>
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
          icon="angle double left"
          content="Change time slots"
        />
      </div>
    </Container>
  );
}
