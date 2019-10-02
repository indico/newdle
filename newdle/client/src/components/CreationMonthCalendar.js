import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getCreationCalendarDates, getCreationCalendarActiveDate} from '../selectors';
import {setCreationActiveDate} from '../actions';
import {serializeDate} from '../util/date';
import Calendar from './Calendar';

export default function CreationMonthCalendar() {
  const dispatch = useDispatch();
  const calendarDates = useSelector(getCreationCalendarDates);
  const activeDate = useSelector(getCreationCalendarActiveDate);
  const handleDateChange = useCallback(
    date => dispatch(setCreationActiveDate(serializeDate(date))),
    [dispatch]
  );
  const isDayHighlighted = useCallback(date => calendarDates.includes(serializeDate(date)), [
    calendarDates,
  ]);

  return (
    <Calendar
      activeDate={activeDate}
      handleDateChange={handleDateChange}
      isDayHighlighted={isDayHighlighted}
    />
  );
}
