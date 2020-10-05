import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {t} from '@lingui/macro';
import {Button, Container, Icon} from 'semantic-ui-react';
import {setStep} from '../../actions';
import {areParticipantsDefined} from '../../selectors';
import UserSearch from './userSearch';
import styles from './creation.module.scss';

export default function ParticipantsStep() {
  const dispatch = useDispatch();
  const participantsDefined = useSelector(areParticipantsDefined);
  return (
    <>
      <UserSearch />
      <Container>
        <div className={styles['button-row']}>
          <Button color="violet" icon labelPosition="right" onClick={() => dispatch(setStep(2))}>
            {participantsDefined ? t`Next` : t`Skip`}
            <Icon name="angle right" />
          </Button>
        </div>
      </Container>
    </>
  );
}
