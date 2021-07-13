import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {Trans} from '@lingui/macro';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import {Icon, Table, Radio, Popup} from 'semantic-ui-react';
import {
  getNewdleDuration,
  getNewdleParticipants,
  getNewdleTimezone,
  getNewdleTimeslots,
} from '../selectors';
import {serializeDate, toMoment} from '../util/date';
import AvailabilityRing from './AvailabilityRing';
import styles from './ParticipantGrid.module.scss';

function formatMeetingTime(startTime, duration) {
  const endTime = moment(startTime)
    .add(duration, 'm')
    .format('HH:mm');
  return `${serializeDate(startTime, 'HH:mm')} - ${endTime}`;
}

function FooterCell({
  participants,
  timeslot,
  finalDate,
  finalized,
  hoveredColumn,
  setHoveredColumn,
}) {
  const hovered = hoveredColumn === timeslot;
  const active = finalDate === timeslot;

  const availableCount = participants.filter(({answers}) => answers[timeslot] === 'available')
    .length;
  const unavailableCount = participants.filter(({answers}) => answers[timeslot] === 'unavailable')
    .length;
  const ifneedbeCount = participants.filter(({answers}) => answers[timeslot] === 'ifneedbe').length;

  const className = active ? styles.active : hovered && !finalized ? styles.hover : null;

  return (
    <Table.HeaderCell
      textAlign="center"
      className={className}
      onMouseEnter={() => setHoveredColumn(timeslot)}
      onMouseLeave={() => setHoveredColumn(null)}
    >
      <AvailabilityRing
        available={availableCount}
        unavailable={unavailableCount}
        ifNeeded={ifneedbeCount}
        totalParticipants={participants.length}
        radius={40}
        strokeWidth={7}
      />
    </Table.HeaderCell>
  );
}

FooterCell.propTypes = {
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
    })
  ).isRequired,
  timeslot: PropTypes.string,
  finalDate: PropTypes.string,
  finalized: PropTypes.bool.isRequired,
  hoveredColumn: PropTypes.string,
  setHoveredColumn: PropTypes.func.isRequired,
};

function DateCell({
  timeslot,
  finalDate,
  setFinalDate,
  isCreator,
  finalized,
  hoveredColumn,
  setHoveredColumn,
}) {
  const newdleTimezone = useSelector(getNewdleTimezone);
  const duration = useSelector(getNewdleDuration);

  const startTime = toMoment(timeslot, 'YYYY-MM-DDTHH:mm');
  const hovered = hoveredColumn === timeslot;
  const active = finalDate === timeslot;

  let className = styles.header;
  if (active) {
    className += ` ${styles.active}`;
  } else if (hovered && !finalized) {
    className += ` ${styles.hover}`;
  }

  if (isCreator && !finalized) {
    className += ` ${styles.pointer}`;
  }

  return (
    <Table.HeaderCell
      textAlign="center"
      className={className}
      onClick={() => !finalized && isCreator && setFinalDate(timeslot)}
      onMouseEnter={() => setHoveredColumn(timeslot)}
      onMouseLeave={() => setHoveredColumn(null)}
    >
      <div>
        <div className={styles['date']}>{startTime.format('D MMM')}</div>
        <div className={styles['time']}>{formatMeetingTime(startTime, duration)}</div>
        <div className={styles['timezone']}>{newdleTimezone}</div>
      </div>
      {!finalized && isCreator && <Radio name="slot-id" value={timeslot} checked={active} />}
    </Table.HeaderCell>
  );
}

DateCell.propTypes = {
  timeslot: PropTypes.string,
  finalDate: PropTypes.string,
  setFinalDate: PropTypes.func.isRequired,
  isCreator: PropTypes.bool.isRequired,
  finalized: PropTypes.bool.isRequired,
  hoveredColumn: PropTypes.string,
  setHoveredColumn: PropTypes.func.isRequired,
};

function NameCell({participant: {avatar_url, comment, name}}) {
  const avatarURL = new URL(avatar_url, window.location.origin);
  avatarURL.searchParams.set('size', 30);

  const trigger = (
    <Table.Cell className={styles['avatar-cell']}>
      {comment && (
        <Icon
          corner="top left"
          flipped="horizontally"
          name="comment outline"
          className={`${styles['middle-aligned']} ${styles['comment-icon']}`}
        />
      )}
      <div className={`${styles['middle-aligned']} ${styles.avatar}`}>
        <img className="user-avatar" src={avatarURL} alt="" />
      </div>
      <span className={styles['middle-aligned']}>{name}</span>
    </Table.Cell>
  );

  return comment ? (
    <Popup wide position="top center" mouseEnterDelay={100} trigger={trigger} content={comment} />
  ) : (
    trigger
  );
}

NameCell.propTypes = {
  participant: PropTypes.shape({
    avatar_url: PropTypes.string.isRequired,
    comment: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
};

function ParticipantRow({participant, hoveredColumn, setHoveredColumn, finalDate, finalized}) {
  const timeslots = useSelector(getNewdleTimeslots);
  const hasAnswered = Object.keys(participant.answers).length !== 0;

  return (
    <Table.Row textAlign="center">
      <NameCell participant={participant} />
      {timeslots.map(timeslot => {
        const status = participant.answers[timeslot];
        const hovered = timeslot === hoveredColumn;
        const active = finalDate === timeslot;
        const positive = status === 'available';
        const negative = status === 'unavailable';

        const statusColors = {available: 'green', ifneedbe: 'yellow', unavailable: 'red'};

        const icon = status ? (
          <Icon
            name={status !== 'unavailable' ? 'checkmark' : 'close'}
            color={statusColors[status]}
            size="large"
          />
        ) : hasAnswered ? (
          <Icon name="question" color="grey" size="large" />
        ) : null;

        const className = active
          ? styles.active
          : hovered && !finalized
          ? styles.hover
          : finalized
          ? styles.finalized
          : null;

        return (
          <Table.Cell
            positive={positive}
            negative={negative}
            key={timeslot}
            textAlign="center"
            className={className}
            onMouseEnter={() => setHoveredColumn(timeslot)}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            {icon}
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
}

ParticipantRow.propTypes = {
  participant: PropTypes.shape({
    answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    comment: PropTypes.string,
  }).isRequired,
  hoveredColumn: PropTypes.string,
  setHoveredColumn: PropTypes.func.isRequired,
  finalDate: PropTypes.string,
  finalized: PropTypes.bool.isRequired,
};

export default function ParticipantGrid({finalDate, setFinalDate, isCreator, finalized}) {
  const timeslots = useSelector(getNewdleTimeslots);
  const participants = useSelector(getNewdleParticipants);
  const [hoveredColumn, setHoveredColumn] = useState(null);

  if (timeslots.length === 0) {
    return null;
  }

  return (
    <div className={styles['participant-grid']}>
      <Table textAlign="center">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textAlign="center">
              <Trans>Participants</Trans>
            </Table.HeaderCell>
            {timeslots.map(timeslot => (
              <DateCell
                key={timeslot}
                timeslot={timeslot}
                finalDate={finalDate}
                setFinalDate={setFinalDate}
                isCreator={isCreator}
                finalized={finalized}
                hoveredColumn={hoveredColumn}
                setHoveredColumn={setHoveredColumn}
              />
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {_.sortBy(participants, ['name']).map(participant => (
            <ParticipantRow
              key={participant.id}
              participant={participant}
              finalDate={finalDate}
              hoveredColumn={hoveredColumn}
              setHoveredColumn={setHoveredColumn}
              finalized={finalized}
            />
          ))}
        </Table.Body>
        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell></Table.HeaderCell>
            {timeslots.map(timeslot => (
              <FooterCell
                participants={participants}
                key={timeslot}
                timeslot={timeslot}
                finalDate={finalDate}
                finalized={finalized}
                hoveredColumn={hoveredColumn}
                setHoveredColumn={setHoveredColumn}
              />
            ))}
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  );
}

ParticipantGrid.propTypes = {
  finalDate: PropTypes.string,
  setFinalDate: PropTypes.func.isRequired,
  isCreator: PropTypes.bool.isRequired,
  finalized: PropTypes.bool.isRequired,
};
