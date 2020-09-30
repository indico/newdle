import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect, Route, Switch, useParams} from 'react-router-dom';
import {Loader} from 'semantic-ui-react';
import {abortCreation, fetchNewdle, setStep} from '../../actions';
import {getNewdle, isLoggedIn} from '../../selectors';
import {usePageTitle} from '../../util/hooks';
import FinalStep from './FinalStep';
import ParticipantsStep from './ParticipantsStep';
import {STEPS} from './steps';
import TimeslotsStep from './timeslots';

export default function EditPage() {
  const {code: newdleCode} = useParams();
  const isUserLoggedIn = useSelector(isLoggedIn);
  const newdle = useSelector(getNewdle);
  const dispatch = useDispatch();
  usePageTitle('Editing newdle');

  useEffect(() => {
    dispatch(setStep(STEPS.TIMESLOTS));
    // TODO: We could probably re-use the selector's value
    if (newdleCode) {
      dispatch(fetchNewdle(newdleCode, true)); // TODO: editing state needs to be set immediately
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
    <Switch>
      <Route exact path="/newdle/:code/edit" component={TimeslotsStep} />
      <Route path="/newdle/:code/edit/participants" component={ParticipantsStep} />
      <Route path="/newdle/:code/edit/options" component={FinalStep} />
    </Switch>
  );
}
