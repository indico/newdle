import 'react-dates/initialize';
import React from 'react';
import {DayPickerSingleDateController as DayPicker} from 'react-dates';
import {HTML5_FMT} from 'moment';
import PropTypes from 'prop-types';
import {Segment} from 'semantic-ui-react';
import {toMoment, serializeDate} from '../../util/date';
import {useIsSmallScreen} from '../../util/hooks';
import 'react-dates/lib/css/_datepicker.css';
import styles from './Calendar.module.scss';

export default function Calendar({
  activeDate,
  handleDateChange,
  isDayHighlighted,
  initialVisibleMonth,
}) {
  const isTabletOrMobile = useIsSmallScreen();
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
        // force rerender when month changes to show the new month
        // see: https://github.com/airbnb/react-dates/issues/1320
        key={serializeDate(activeDate, 'YYYY-MM')}
        hideKeyboardShortcutsPanel
        focused
        noBorder
        orientation={isTabletOrMobile ? 'vertical' : 'horizontal'}
        verticalHeight={390}
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
