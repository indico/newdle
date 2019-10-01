import 'react-dates/initialize';
import React from 'react';
import PropTypes from 'prop-types';
import {HTML5_FMT} from 'moment';
import {Segment} from 'semantic-ui-react';
import {DayPickerSingleDateController as DayPicker} from 'react-dates';
import {toMoment} from '../../util/date';
import 'react-dates/lib/css/_datepicker.css';
import styles from './Calendar.module.scss';

export default function Calendar({
  activeDate,
  handleDateChange,
  isDayHighlighted,
  initialVisibleMonth,
}) {
  return (
    <Segment className={styles.calendar} attached="top">
      <DayPicker
        date={toMoment(activeDate, HTML5_FMT.DATE)}
        firstDayOfWeek={1}
        onDateChange={handleDateChange}
        numberOfMonths={1}
        isOutsideRange={() => false}
        isDayHighlighted={isDayHighlighted}
        initialVisibleMonth={initialVisibleMonth}
        hideKeyboardShortcutsPanel
        focused
        noBorder
      />
    </Segment>
  );
}

Calendar.propTypes = {
  activeDate: PropTypes.string.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  isDayHighlighted: PropTypes.func.isRequired,
  initialVisibleMonth: PropTypes.func,
};

Calendar.defaultProps = {
  initialVisibleMonth: null,
};
