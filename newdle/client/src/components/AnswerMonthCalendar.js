import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getAnswerCalendarDates, getAnswerActiveDate} from '../selectors';
import {setAnswerActiveDate} from '../actions';
import {HTML5_FMT} from 'moment';
import {serializeDate, toMoment} from '../util/date';
import Calendar from './Calendar';

export default function AnswerMonthCalendar() {
  const dispatch = useDispatch();
  const calendarDates = useSelector(getAnswerCalendarDates);
  const activeDate = useSelector(getAnswerActiveDate);
  const handleDateChange = useCallback(date => dispatch(setAnswerActiveDate(serializeDate(date))), [
    dispatch,
  ]);
  const isDayHighlighted = useCallback(date => calendarDates.includes(serializeDate(date)), [
    calendarDates,
  ]);

  return (
    <Calendar
      activeDate={activeDate}
      handleDateChange={handleDateChange}
      isDayHighlighted={isDayHighlighted}
      initialVisibleMonth={() => toMoment(activeDate, HTML5_FMT.DATE)}
    />
  );
}
