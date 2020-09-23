import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect, useParams} from 'react-router-dom';
import {Loader} from 'semantic-ui-react';
import {abortCreation, fetchNewdle, setStep} from '../../actions';
import {getNewdle, getStep, isLoggedIn, shouldConfirmAbortCreation} from '../../selectors';
import {usePageTitle} from '../../util/hooks';
import UnloadPrompt from '../UnloadPrompt';
import FinalStep from './FinalStep';
import {STEPS} from './steps';
import TimeslotsStep from './timeslots';

export default function EditPage() {
  const {code: newdleCode} = useParams();
  const isUserLoggedIn = useSelector(isLoggedIn);
  const step = useSelector(getStep);
  const shouldConfirm = useSelector(shouldConfirmAbortCreation);
  const newdle = useSelector(getNewdle);
  const dispatch = useDispatch();
  usePageTitle('Editing newdle');

  useEffect(() => {
    dispatch(setStep(STEPS.TIMESLOTS));
    // TODO: We could probably re-use the selector's value
    if (newdleCode) {
      dispatch(fetchNewdle(newdleCode, true));
    }

    return () => {
      dispatch(abortCreation());
    };
  }, [dispatch, newdleCode]);

  if (!isUserLoggedIn) {
    return <Redirect to="/" />;
  }
  if (!newdle) {
    return <Loader active />;
  }

  return (
    <>
      {step === STEPS.TIMESLOTS && <TimeslotsStep />}
      {step === STEPS.FINAL && <FinalStep />}
      <UnloadPrompt router active={shouldConfirm} />
    </>
  );
}
