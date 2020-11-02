import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {abortCreation} from '../../actions';
import {getStep, isLoggedIn, shouldConfirmAbortCreation} from '../../selectors';
import {usePageTitle} from '../../util/hooks';
import UnloadPrompt from '../UnloadPrompt';
import FinalStep from './FinalStep';
import ParticipantsStep from './ParticipantsStep';
import {STEPS} from './steps';
import TimeslotsStep from './timeslots';

export default function CreationPage() {
  const isUserLoggedIn = useSelector(isLoggedIn);
  const step = useSelector(getStep);
  const shouldConfirm = useSelector(shouldConfirmAbortCreation);
  const dispatch = useDispatch();
  usePageTitle('Create newdle');

  useEffect(() => {
    return () => {
      dispatch(abortCreation());
    };
  }, [dispatch]);

  if (!isUserLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <>
      {step === STEPS.PARTICIPANTS && <ParticipantsStep />}
      {step === STEPS.TIMESLOTS && <TimeslotsStep />}
      {step === STEPS.FINAL && <FinalStep />}
      <UnloadPrompt router active={shouldConfirm} />
    </>
  );
}
