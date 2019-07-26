import 'react-dates/initialize';
import React, {useCallback, useEffect} from 'react';
import {HTML5_FMT} from 'moment';
import {useDispatch, useSelector} from 'react-redux';
import {DayPickerSingleDateController as DayPicker} from 'react-dates';
import {getCalendarDates, getCalendarActiveDate} from './selectors';
import {setActiveDate, clearCalendarActiveDate} from './actions';
import {serializeDate, toMoment} from './util/date';

import 'react-dates/lib/css/_datepicker.css';
import styles from './Calendar.module.scss';

export default function Calendar() {
  const calendarDates = useSelector(getCalendarDates);
  const activeDate = useSelector(getCalendarActiveDate);
  const dispatch = useDispatch();

  const handleDateChange = useCallback(date => dispatch(setActiveDate(serializeDate(date))), [
    dispatch,
  ]);

  const isDayHighlighted = useCallback(date => calendarDates.includes(serializeDate(date)), [
    calendarDates,
  ]);

  useEffect(() => {
    return () => {
      dispatch(clearCalendarActiveDate());
    };
  }, [dispatch]);

  return (
    <div className={styles.calendar}>
      <DayPicker
        date={toMoment(activeDate, HTML5_FMT.DATE)}
        firstDayOfWeek={1}
        onDateChange={handleDateChange}
        numberOfMonths={1}
        isOutsideRange={() => false}
        isDayHighlighted={isDayHighlighted}
        hideKeyboardShortcutsPanel
        focused
      />
    </div>
  );
}
