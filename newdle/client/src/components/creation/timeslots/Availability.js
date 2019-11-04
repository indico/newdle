import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getCreationCalendarActiveDate,
  getParticipantsWithUnkownAvailabilityForDate,
  getParticipantsBusyTimesForDate,
  getTimezone,
} from '../../../selectors';
import {serializeDate} from '../../../util/date';
import Timeline from './Timeline';
import {fetchParticipantBusyTimes} from '../../../actions';

export default React.memo(function Availability() {
  const dispatch = useDispatch();

  const date = serializeDate(useSelector(getCreationCalendarActiveDate));
  const missing = useSelector(state => getParticipantsWithUnkownAvailabilityForDate(state, date));
  const busyTimes = useSelector(state => getParticipantsBusyTimesForDate(state, date));
  const tz = useSelector(getTimezone);

  useEffect(() => {
    dispatch(fetchParticipantBusyTimes(missing, date, tz));
  }, [dispatch, missing, date, tz]);

  // explicit key to avoid keeping state between dates.
  // like this we automatically leave/enter edit mode based on whether
  // there are any timeline entries for the given day
  return <Timeline key={date} date={date} availability={busyTimes} />;
});
