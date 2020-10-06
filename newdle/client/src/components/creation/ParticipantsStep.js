import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {t, Trans} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Button, Container, Icon} from 'semantic-ui-react';
import {setStep} from '../../actions';
import client from '../../client';
import {areParticipantsDefined, getCreatedNewdle, getParticipantData} from '../../selectors';
import {STEPS} from './steps';
import UserSearch from './userSearch';
import styles from './creation.module.scss';

export default function ParticipantsStep({isEditing}) {
  const dispatch = useDispatch();
  const participantsDefined = useSelector(areParticipantsDefined);
  const participants = useSelector(getParticipantData);
  const activeNewdle = useSelector(getCreatedNewdle);
  const history = useHistory();
  const [_editNewdle, submitting] = client.useBackendLazy(client.updateNewdle);

  async function editNewdle() {
    const newdle = await _editNewdle(activeNewdle.code, {participants});

    if (newdle) {
      history.push('/new/success');
    }
  }

  return (
    <>
      <UserSearch />
      <Container>
        <div className={styles['button-row']}>
          {!isEditing ? (
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
            <Button color="violet" type="submit" onClick={editNewdle} loading={submitting}>
              <Trans>Confirm</Trans>
            </Button>
          )}
        </div>
      </Container>
    </>
  );
}

ParticipantsStep.propTypes = {
  isEditing: PropTypes.bool,
};

ParticipantsStep.defaultProps = {
  isEditing: false,
};
