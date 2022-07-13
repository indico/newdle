import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Navigate, Route, Routes, useParams} from 'react-router-dom';
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
    return <Navigate to="/" />;
  }
  if (!newdle) {
    return <Loader active />;
  }

  return (
    <Routes>
      <Route exact path="" element={<Navigate replace to="timeslots" />} />
      <Route exact path="timeslots" element={<TimeslotsStep isEditing />} />
      <Route exact path="participants" element={<ParticipantsStep isEditing />} />
      <Route exact path="options" element={<FinalStep isEditing />} />
    </Routes>
  );
}
