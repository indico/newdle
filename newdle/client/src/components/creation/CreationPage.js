import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Navigate, useLocation} from 'react-router-dom';
import {t} from '@lingui/macro';
import {
  abortCreation,
  addParticipants,
  addTimeslot,
  setTitle,
  setPrivate,
  setNotification,
  setDuration,
  setTimezone,
  setLimitedSlots,
} from '../../actions';
import {getStep, isLoggedIn, shouldConfirmAbortCreation} from '../../selectors';
import {usePageTitle} from '../../util/hooks';
import UnloadPrompt from '../UnloadPrompt';
import FinalStep from './FinalStep';
import ParticipantsStep from './ParticipantsStep';
import {STEPS} from './steps';
import TimeslotsStep from './timeslots';

export default function CreationPage() {
  const location = useLocation();
  const isUserLoggedIn = useSelector(isLoggedIn);
  const step = useSelector(getStep);
  const shouldConfirm = useSelector(shouldConfirmAbortCreation);
  const dispatch = useDispatch();
  usePageTitle(t`Create newdle`);

  useEffect(() => {
    dispatch(abortCreation());
    // When cloning a newdle we want to prefill the state with
    // the original newdle data
    const cloneData = location.state?.cloneData;
    if (cloneData) {
      dispatch(setTimezone(cloneData.timezone));
      dispatch(setDuration(cloneData.duration));
      if (cloneData.title !== null) {
        dispatch(setTitle(cloneData.title));
      }
      if (cloneData.private !== null) {
        dispatch(setPrivate(cloneData.private));
      }
      if (cloneData.notify !== null) {
        dispatch(setNotification(cloneData.notify));
      }
      if (cloneData.limitedSlots !== null) {
        dispatch(setLimitedSlots(cloneData.limitedSlots));
      }
      if (cloneData.participants.length) {
        dispatch(addParticipants(cloneData.participants));
      }
      for (const slot of cloneData.timeslots) {
        const [date, time] = slot.split('T');
        dispatch(addTimeslot(date, time));
      }
      // Clear location state in case the user refreshes the page
      window.history.replaceState({}, document.title);
    }
  }, [dispatch, location.state]);

  if (!isUserLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <>
      {step === STEPS.PARTICIPANTS && <ParticipantsStep isCloning={!!location.state} />}
      {step === STEPS.TIMESLOTS && <TimeslotsStep />}
      {step === STEPS.FINAL && <FinalStep />}
      <UnloadPrompt router active={shouldConfirm} />
    </>
  );
}
