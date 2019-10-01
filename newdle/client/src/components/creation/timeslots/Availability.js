import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getCalendarActiveDate,
  getParticipantsWithUnkownAvailabilityForDate,
  getParticipantsBusyTimesForDate,
} from '../../../selectors';
import {serializeDate} from '../../../util/date';
import Timeline from './Timeline';
import {fetchParticipantBusyTimes} from '../../../actions';

export default React.memo(function Availability() {
  const dispatch = useDispatch();

  const date = serializeDate(useSelector(getCalendarActiveDate));
  const missing = useSelector(state => getParticipantsWithUnkownAvailabilityForDate(state, date));
  const busyTimes = useSelector(state => getParticipantsBusyTimesForDate(state, date));

  useEffect(() => {
    dispatch(fetchParticipantBusyTimes(missing, date));
  }, [dispatch, missing, date]);

  // explicit key to avoid keeping state between dates.
  // like this we automatically leave/enter edit mode based on whether
  // there are any timeline entries for the given da
  return <Timeline key={date} date={date} availability={busyTimes} />;
});
