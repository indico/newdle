import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {HTML5_FMT} from 'moment';
import PropTypes from 'prop-types';
import {setAnswerActiveDate} from '../../actions';
import {
  getCalendarDates,
  getActiveDate,
  getActiveDateIndex,
  getActivePosition,
  getDateIndexes,
} from '../../answerSelectors';
import {serializeDate, toMoment} from '../../util/date';
import {useNumDaysVisible} from '../../util/hooks';
import Calendar from '../common/Calendar';

export default function MonthCalendar({disabled}) {
  const dispatch = useDispatch();
  const calendarDates = useSelector(getCalendarDates);
  const activeDate = useSelector(getActiveDate);
  const dateIndexes = useSelector(getDateIndexes);
  const numDaysVisible = useNumDaysVisible();
  const activeDateIndex = useSelector(getActiveDateIndex);
  const activePosition = useSelector(getActivePosition);
  const handleDateChange = useCallback(
    date => {
      const dateIndex = dateIndexes[serializeDate(date)];
      let datePos;
      const currentStart = activeDateIndex - activePosition;
      if (currentStart <= dateIndex && currentStart + numDaysVisible > dateIndex) {
        // no need to switch the whole view when the new date is already visible
        datePos = dateIndex - currentStart;
      } else {
        // otherwise the whole view gets switched to the new date
        datePos =
          dateIndex + numDaysVisible > calendarDates.length
            ? numDaysVisible - (calendarDates.length - dateIndex)
            : 0;
      }
      dispatch(setAnswerActiveDate(serializeDate(date), datePos));
    },
    [activeDateIndex, activePosition, calendarDates.length, dateIndexes, dispatch, numDaysVisible]
  );
  const isDayHighlighted = useCallback(date => calendarDates.includes(serializeDate(date)), [
    calendarDates,
  ]);

  return (
    <Calendar
      activeDate={activeDate}
      handleDateChange={disabled ? () => {} : handleDateChange}
      isDayHighlighted={isDayHighlighted}
      initialVisibleMonth={() => toMoment(activeDate, HTML5_FMT.DATE)}
    />
  );
}

MonthCalendar.propTypes = {
  disabled: PropTypes.bool,
};
