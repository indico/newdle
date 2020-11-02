import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect, Route, Switch, useParams} from 'react-router-dom';
import {Loader} from 'semantic-ui-react';
import {abortCreation, fetchNewdle} from '../../actions';
import {getCreatedNewdle, isLoggedIn} from '../../selectors';
import {usePageTitle} from '../../util/hooks';
import FinalStep from './FinalStep';
import ParticipantsStep from './ParticipantsStep';
import TimeslotsStep from './timeslots';

export default function EditPage() {
  const {code: newdleCode} = useParams();
  const isUserLoggedIn = useSelector(isLoggedIn);
  const newdle = useSelector(getCreatedNewdle);
  const dispatch = useDispatch();
  usePageTitle('Editing newdle');

  useEffect(() => {
    if (newdleCode) {
      // TODO: We should re-use the existing newdle data instead. However, abortCreation will clear the state,
      //  causing an edit -> summary -> edit to become empty if we remove the line below
      //  Ideally, we should move abortCreation() - state flushing - to happen on mount instead of unmount.
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
    <Switch>
      <Redirect exact from="/newdle/:code/edit" to="/newdle/:code/edit/timeslots" />
      <Route exact path="/newdle/:code/edit/timeslots" render={() => <TimeslotsStep isEditing />} />
      <Route
        exact
        path="/newdle/:code/edit/participants"
        render={() => <ParticipantsStep isEditing />}
      />
      <Route exact path="/newdle/:code/edit/options" render={() => <FinalStep isEditing />} />
    </Switch>
  );
}
