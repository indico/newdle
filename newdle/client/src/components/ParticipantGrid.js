import React from 'react';
import {useSelector} from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import {Icon, Table} from 'semantic-ui-react';
import {
  getNewdleDuration,
  getNewdleParticipants,
  getNewdleTimezone,
  getNewdleTimeslots,
} from '../selectors';
import {serializeDate, toMoment} from '../util/date';
import UserAvatar from './UserAvatar';
import styles from './ParticipantGrid.module.scss';

function formatMeetingTime(startTime, duration) {
  const endTime = moment(startTime)
    .add(duration, 'm')
    .format('HH:mm');
  return `${serializeDate(startTime, 'HH:mm')} - ${endTime}`;
}

function DateCell({timeslot}) {
  const newdleTimezone = useSelector(getNewdleTimezone);
  const duration = useSelector(getNewdleDuration);

  const startTime = toMoment(timeslot, 'YYYY-MM-DDTHH:mm');
  return (
    <Table.HeaderCell textAlign="center">
      <div>
        <div className={styles['date']}>{startTime.format('D MMM')}</div>
        <div className={styles['time']}>{formatMeetingTime(startTime, duration)}</div>
        <div className={styles['timezone']}>{newdleTimezone}</div>
      </div>
    </Table.HeaderCell>
  );
}

DateCell.propTypes = {
  timeslot: PropTypes.string,
};

function ParticipantRow({participant}) {
  const timeslots = useSelector(getNewdleTimeslots);

  return (
    <Table.Row textAlign="center">
      <Table.Cell style={{whiteSpace: 'nowrap'}}>
        <UserAvatar user={participant} size={30} className={styles['participant-avatar']} />
        <span className={styles['participant-avatar-label']}>{participant.name}</span>
      </Table.Cell>
      {timeslots.map(timeslot => {
        const status = participant.answers[timeslot];
        return (
          <Table.Cell key={timeslot} textAlign="center">
            {status ? (
              status === 'available' ? (
                <Icon color="green" name="checkmark" size="large" />
              ) : status === 'unavailable' ? (
                <Icon color="red" name="close" size="large" />
              ) : (
                <Icon color="yellow" name="question" size="large" />
              )
            ) : null}
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
}

ParticipantRow.propTypes = {
  participant: PropTypes.shape({
    answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
    email: PropTypes.string,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default function ParticipantGrid() {
  const timeslots = useSelector(getNewdleTimeslots);
  const participants = useSelector(getNewdleParticipants);

  if (timeslots.length === 0) {
    return null;
  }

  return (
    <div className={styles['participant-grid']}>
      <Table textAlign="center">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textAlign="center" className={styles['participant-grid-cell']}>
              Participants
            </Table.HeaderCell>
            {timeslots.map(timeslot => (
              <DateCell key={timeslot} timeslot={timeslot} />
            ))}
          </Table.Row>
          {_.sortBy(participants, ['name']).map(participant => (
            <ParticipantRow key={participant.id} participant={participant} />
          ))}
        </Table.Header>
      </Table>
    </div>
  );
}
