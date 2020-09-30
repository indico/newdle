import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {t} from '@lingui/macro';
import {Button, Container, Icon} from 'semantic-ui-react';
import {newdleCreated, setStep} from '../../actions';
import client from '../../client';
import {areParticipantsDefined, getEditingNewdle, getParticipantData} from '../../selectors';
import {STEPS} from './steps';
import UserSearch from './userSearch';
import styles from './creation.module.scss';

export default function ParticipantsStep() {
  const dispatch = useDispatch();
  const participantsDefined = useSelector(areParticipantsDefined);
  const participants = useSelector(getParticipantData);
  const editingNewdle = useSelector(getEditingNewdle);
  const history = useHistory();
  const [editNewdle, submitting] = client.useBackendLazy(client.editNewdle);

  async function setParticipants() {
    const newdle = await editNewdle(editingNewdle.code, {participants});

    if (newdle) {
      dispatch(newdleCreated(newdle)); // TODO: success?
      history.push(`/newdle/${editingNewdle.code}/summary`);
    }
  }

  return (
    <>
      <UserSearch />
      <Container>
        <div className={styles['button-row']}>
          {!editingNewdle ? (
            <Button
              color="violet"
              icon
              labelPosition="right"
              onClick={() => dispatch(setStep(STEPS.TIMESLOTS))}
            >
              {participantsDefined ? t`Next` : t`Skip`}
              <Icon name="angle right" />
            </Button>
          ) : (
            <Button onClick={setParticipants} loading={submitting}>
              Submit
            </Button>
          )}
        </div>
      </Container>
    </>
  );
}
