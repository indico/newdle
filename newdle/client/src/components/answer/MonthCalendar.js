import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getCalendarDates, getActiveDate} from '../../answerSelectors';
import {setAnswerActiveDate} from '../../actions';
import {HTML5_FMT} from 'moment';
import {serializeDate, toMoment} from '../../util/date';
import Calendar from '../common/Calendar';

export default function MonthCalendar() {
  const dispatch = useDispatch();
  const calendarDates = useSelector(getCalendarDates);
  const activeDate = useSelector(getActiveDate);
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
