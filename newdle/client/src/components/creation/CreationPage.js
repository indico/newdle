import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {getStep, isLoggedIn, shouldConfirmAbortCreation} from '../../selectors';
import {abortCreation} from '../../actions';
import UnloadPrompt from '../UnloadPrompt';
import ParticipantsStep from './ParticipantsStep';
import TimeslotsStep from './timeslots';
import FinalStep from './FinalStep';
import {usePageTitle} from '../../util/hooks';

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
      {step === 1 && <ParticipantsStep />}
      {step === 2 && <TimeslotsStep />}
      {step === 3 && <FinalStep />}
      <UnloadPrompt router active={shouldConfirm} />
    </>
  );
}
