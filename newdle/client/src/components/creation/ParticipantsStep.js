import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {t, Trans} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Button, Container, Icon, Message} from 'semantic-ui-react';
import {clearParticipantCodes, setStep, updateNewdle} from '../../actions';
import client from '../../client';
import {areParticipantsDefined, getCreatedNewdle, getParticipants} from '../../selectors';
import {STEPS} from './steps';
import UserSearch from './userSearch';
import styles from './creation.module.scss';

export default function ParticipantsStep({isEditing, isCloning}) {
  const dispatch = useDispatch();
  const participantsDefined = useSelector(areParticipantsDefined);
  const participants = useSelector(getParticipants);
  const activeNewdle = useSelector(getCreatedNewdle);
  const history = useHistory();
  const [_editNewdle, submitting] = client.useBackendLazy(client.updateNewdle);

  async function editNewdle() {
    const newdle = await _editNewdle(activeNewdle.code, {participants});

    if (newdle) {
      dispatch(clearParticipantCodes(newdle.code));
      dispatch(updateNewdle(newdle));
      history.push(`/newdle/${newdle.code}/summary`);
    }
  }

  return (
    <>
      {isCloning && (
        <div className={styles['cloning-message']}>
          <Message info>
            <p>
              <Trans>
                We have prefilled this form with the data you selected. If needed, you can make
                adjustments and then finalize your newdle in the last step.
              </Trans>
            </p>
          </Message>
        </div>
      )}
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
  isCloning: PropTypes.bool,
};

ParticipantsStep.defaultProps = {
  isEditing: false,
  isCloning: false,
};
