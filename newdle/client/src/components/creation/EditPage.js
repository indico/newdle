import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect, Route, Switch, useParams} from 'react-router-dom';
import {t} from '@lingui/macro';
import {Loader} from 'semantic-ui-react';
import {fetchNewdle} from '../../actions';
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
  usePageTitle(t`Editing newdle`);

  useEffect(() => {
    if (!newdle && newdleCode) {
      dispatch(fetchNewdle(newdleCode, true));
    }
  }, [dispatch, newdle, newdleCode]);

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
