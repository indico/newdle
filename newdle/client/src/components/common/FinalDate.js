import React from 'react';
import {Trans} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Header, Icon} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../../util/date';
import styles from './FinalDate.module.scss';

export default function FinalDate({
  title,
  final_dt: finalDate,
  duration,
  timezone,
  limited_slots: limitedSlots,
}) {
  return (
    <div className={styles.container}>
      <Header className={styles.header} as="h2">
        {limitedSlots ? (
          <Trans>Your selected timeslot is:</Trans>
        ) : (
          <Trans>{title} will take place on:</Trans>
        )}
      </Header>
      <div className={styles.datetime}>
        <Icon name="calendar alternate outline" />
        {serializeDate(finalDate, 'MMMM Do YYYY')}
      </div>
      <div className={styles.datetime}>
        <Icon name="clock outline" />
        {serializeDate(finalDate, 'H:mm')} -{' '}
        {serializeDate(toMoment(finalDate).add(duration, 'm'), 'H:mm')} ({timezone})
      </div>
    </div>
  );
}

FinalDate.propTypes = {
  title: PropTypes.string.isRequired,
  final_dt: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  timezone: PropTypes.string.isRequired,
  limited_slots: PropTypes.bool.isRequired,
};
