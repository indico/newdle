import React from 'react';
import {Trans} from '@lingui/macro';
import moment from 'moment';
import PropTypes from 'prop-types';
import {Icon, Table, Radio, Popup} from 'semantic-ui-react';
import {serializeDate, toMoment} from '../util/date';
import AvailabilityRing from './AvailabilityRing';
import styles from './GridCommon.module.scss';

function formatMeetingTime(startTime, duration) {
  const endTime = moment(startTime).add(duration, 'm');
  return `${serializeDate(startTime, 'HH:mm')} - ${serializeDate(endTime, 'HH:mm')}`;
}

export function FooterCell({
  participants,
  timeslot,
  interactive,
  active,
  hovered,
  onMouseEnter,
  onMouseLeave,
  limitedSlots,
}) {
  const availableCount = participants.filter(
    ({answers}) => answers[timeslot] === 'available'
  ).length;
  const unavailableCount = participants.filter(
    ({answers}) => answers[timeslot] === 'unavailable'
  ).length;
  const ifneedbeCount = participants.filter(({answers}) => answers[timeslot] === 'ifneedbe').length;

  const className = active ? styles.active : hovered && interactive ? styles.hover : null;

  return (
    <Table.HeaderCell
      textAlign="center"
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <AvailabilityRing
        available={availableCount}
        unavailable={limitedSlots ? 0 : unavailableCount}
        ifNeeded={ifneedbeCount}
        totalParticipants={limitedSlots ? 1 : participants.length}
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
  interactive: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  hovered: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  limitedSlots: PropTypes.bool.isRequired,
};

export function DateCell({
  timeslot,
  userTz,
  newdleTz,
  newdleDuration,
  setFinalDate,
  isCreator,
  limitedSlots,
  interactive,
  active,
  hovered,
  onMouseEnter,
  onMouseLeave,
}) {
  const selectable = interactive && isCreator && !limitedSlots;

  const startTime = userTz
    ? toMoment(timeslot, 'YYYY-MM-DDTHH:mm', newdleTz).tz(userTz)
    : toMoment(timeslot, 'YYYY-MM-DDTHH:mm', newdleTz);

  let className = styles.header;
  if (active) {
    className += ` ${styles.active}`;
  } else if (hovered && interactive) {
    className += ` ${styles.hover}`;
  }

  if (selectable) {
    className += ` ${styles.pointer}`;
  }

  return (
    <Table.HeaderCell
      textAlign="center"
      className={className}
      onClick={() => selectable && setFinalDate(timeslot)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div>
        <div className={styles['date']}>{startTime.format('D MMM')}</div>
        <div className={styles['time']}>{formatMeetingTime(startTime, newdleDuration)}</div>
        <div className={styles['timezone']}>{userTz || newdleTz}</div>
      </div>
      {selectable && <Radio name="slot-id" value={timeslot} checked={active} />}
    </Table.HeaderCell>
  );
}

DateCell.propTypes = {
  timeslot: PropTypes.string,
  userTz: PropTypes.string,
  newdleTz: PropTypes.string.isRequired,
  newdleDuration: PropTypes.number.isRequired,
  setFinalDate: PropTypes.func,
  isCreator: PropTypes.bool.isRequired,
  limitedSlots: PropTypes.bool.isRequired,
  interactive: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  hovered: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

export function NameCell({participant: {avatar_url, comment, name}, highlighted = false}) {
  let avatarURL;
  if (avatar_url) {
    avatarURL = new URL(avatar_url, window.location.origin);
    avatarURL.searchParams.set('size', 30);
  }

  const trigger = (
    <Table.Cell className={`${styles['avatar-cell']} ${highlighted ? styles.highlighted : ''}`}>
      {comment && (
        <Icon
          corner="top left"
          flipped="horizontally"
          name="comment outline"
          className={`${styles['middle-aligned']} ${styles['comment-icon']}`}
        />
      )}
      {avatarURL ? (
        <div className={`${styles['middle-aligned']} ${styles.avatar}`}>
          <img className="user-avatar" src={avatarURL} alt="" />
        </div>
      ) : (
        <Icon
          size="big"
          name="user circle"
          className={`${styles['middle-aligned']} ${styles.avatar}`}
        />
      )}
      <span className={`${styles['middle-aligned']} ${styles.name}`}>{name}</span>
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
    avatar_url: PropTypes.string,
    comment: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
  highlighted: PropTypes.bool,
};

export function TableHeader({
  timeslots,
  userTz,
  newdleTz,
  newdleDuration,
  interactive,
  finalDate,
  setFinalDate,
  isCreator,
  limitedSlots,
  hoveredColumn,
  setHoveredColumn,
}) {
  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell textAlign="center">
          <Trans>Participants</Trans>
        </Table.HeaderCell>
        {timeslots.map(timeslot => (
          <DateCell
            key={timeslot}
            timeslot={timeslot}
            userTz={userTz}
            newdleTz={newdleTz}
            newdleDuration={newdleDuration}
            interactive={interactive}
            setFinalDate={setFinalDate}
            isCreator={isCreator}
            limitedSlots={limitedSlots}
            hovered={interactive && hoveredColumn === timeslot}
            active={!limitedSlots && finalDate === timeslot}
            onMouseEnter={interactive ? () => setHoveredColumn(timeslot) : null}
            onMouseLeave={interactive ? () => setHoveredColumn(null) : null}
          />
        ))}
      </Table.Row>
    </Table.Header>
  );
}

TableHeader.propTypes = {
  timeslots: PropTypes.array.isRequired,
  userTz: PropTypes.string,
  newdleTz: PropTypes.string.isRequired,
  newdleDuration: PropTypes.number.isRequired,
  interactive: PropTypes.bool.isRequired,
  finalDate: PropTypes.string,
  setFinalDate: PropTypes.func,
  isCreator: PropTypes.bool.isRequired,
  limitedSlots: PropTypes.bool.isRequired,
  hoveredColumn: PropTypes.string,
  setHoveredColumn: PropTypes.func,
};

export function TableFooter({
  participants,
  timeslots,
  interactive,
  finalDate,
  limitedSlots,
  hoveredColumn,
  setHoveredColumn,
}) {
  return (
    <Table.Footer fullWidth>
      <Table.Row>
        <Table.HeaderCell></Table.HeaderCell>
        {timeslots.map(timeslot => (
          <FooterCell
            participants={participants}
            key={timeslot}
            timeslot={timeslot}
            interactive={interactive}
            hovered={interactive && hoveredColumn === timeslot}
            active={!limitedSlots && finalDate === timeslot}
            onMouseEnter={interactive ? () => setHoveredColumn(timeslot) : null}
            onMouseLeave={interactive ? () => setHoveredColumn(null) : null}
            limitedSlots={limitedSlots}
          />
        ))}
      </Table.Row>
    </Table.Footer>
  );
}

TableFooter.propTypes = {
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
    })
  ),
  timeslots: PropTypes.array.isRequired,
  interactive: PropTypes.bool.isRequired,
  finalDate: PropTypes.string,
  limitedSlots: PropTypes.bool.isRequired,
  hoveredColumn: PropTypes.string,
  setHoveredColumn: PropTypes.func,
};
