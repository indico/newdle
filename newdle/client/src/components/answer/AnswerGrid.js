import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Trans} from '@lingui/macro';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import {Icon, Table, Radio, Popup} from 'semantic-ui-react';
import {setAnswer} from '../../actions';
import {getAnswers} from '../../answerSelectors';
import {
  getNewdleDuration,
  getNewdleParticipants,
  getNewdleTimezone,
  getNewdleTimeslots,
} from '../../selectors';
import {serializeDate, toMoment} from '../../util/date';
import AvailabilityRing from '../AvailabilityRing';
import styles from './AnswerGrid.module.scss';

function formatMeetingTime(startTime, duration) {
  const endTime = moment(startTime).add(duration, 'm');
  return `${serializeDate(startTime, 'HH:mm')} - ${serializeDate(endTime, 'HH:mm')}`;
}

/**
 * Computes the width and offset of the red strips used in the answer grid view,
 * which denote the busy time duration. A single timeslot can have multiple of
 * these strips as multiple busy times can overlap with a given timeslot.
 *
 * The red strip has absolute positioning with respect to the parent table cell and
 * is styled using a combination of 'width' and 'left' or 'right' CSS rules.
 *
 */
function getBusyTimesPositions(timeslot, busyTimes, duration) {
  const start = toMoment(timeslot, moment.HTML5_FMT.DATETIME_LOCAL);
  const end = start.clone().add(duration, 'm');
  const date = start.format('YYYY-MM-DD');

  const times = busyTimes[date] || [];
  const styles = [];

  times.forEach(([busyStart, busyEnd]) => {
    busyStart = moment(`${date} ${busyStart}`);
    busyEnd = moment(`${date} ${busyEnd}`);

    if (busyStart.isSameOrBefore(start) && busyEnd.isAfter(start) && busyEnd.isSameOrBefore(end)) {
      const length = busyEnd.diff(start, 'minutes');
      const width = Math.round((length / duration) * 100);
      styles.push({left: '0', width: `${width}%`});
    } else if (busyStart.isSameOrBefore(start) && busyEnd.isAfter(end)) {
      styles.push({left: '0', width: '100%'});
    } else if (busyStart.isAfter(start) && busyStart.isBefore(end) && busyEnd.isSameOrAfter(end)) {
      const length = end.diff(busyStart, 'minutes');
      const width = Math.round((length / duration) * 100);
      styles.push({right: '0', width: `${width}%`});
    } else if (busyStart.isAfter(start) && busyEnd.isBefore(end)) {
      const offset = busyStart.diff(start, 'minutes');
      const left = Math.round((offset / duration) * 100);
      const length = end.diff(busyEnd, 'minutes');
      const width = Math.round((length / duration) * 100);
      styles.push({left: `${left}%`, width: `${width}%`});
    }
  });

  return styles;
}

function FooterCell({
  participants,
  timeslot,
  interactive,
  active,
  hovered,
  onMouseEnter,
  onMouseLeave,
}) {
  const availableCount = participants.filter(({answers}) => answers[timeslot] === 'available')
    .length;
  const unavailableCount = participants.filter(({answers}) => answers[timeslot] === 'unavailable')
    .length;
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
  interactive: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  hovered: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

function DateCell({
  timeslot,
  setFinalDate,
  isCreator,
  interactive,
  active,
  hovered,
  onMouseEnter,
  onMouseLeave,
}) {
  const newdleTimezone = useSelector(getNewdleTimezone);
  const duration = useSelector(getNewdleDuration);

  const startTime = toMoment(timeslot, 'YYYY-MM-DDTHH:mm');

  let className = styles.header;
  if (active) {
    className += ` ${styles.active}`;
  } else if (hovered && interactive) {
    className += ` ${styles.hover}`;
  }

  if (isCreator && interactive) {
    className += ` ${styles.pointer}`;
  }

  return (
    <Table.HeaderCell
      textAlign="center"
      className={className}
      onClick={() => interactive && isCreator && setFinalDate(timeslot)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div>
        <div className={styles['date']}>{startTime.format('D MMM')}</div>
        <div className={styles['time']}>{formatMeetingTime(startTime, duration)}</div>
        <div className={styles['timezone']}>{newdleTimezone}</div>
      </div>
      {interactive && isCreator && <Radio name="slot-id" value={timeslot} checked={active} />}
    </Table.HeaderCell>
  );
}

DateCell.propTypes = {
  timeslot: PropTypes.string,
  setFinalDate: PropTypes.func,
  isCreator: PropTypes.bool.isRequired,
  interactive: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  hovered: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

function NameCell({participant: {avatar_url, comment, name}, highlighted = false}) {
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

function AnswerCell({
  participant,
  timeslot,
  answers,
  hasBusyTimes,
  busyTimes,
  duration,
  selectable,
  unknown,
}) {
  const dispatch = useDispatch();
  const status = selectable ? answers[timeslot] : participant.answers[timeslot];
  const positive = status === 'available';
  const negative = status === 'unavailable';

  let busyPositions = [];
  if (!unknown && hasBusyTimes) {
    busyPositions = getBusyTimesPositions(timeslot, busyTimes, duration);
  }

  const statusColors = {available: 'green', ifneedbe: 'yellow', unavailable: 'red'};

  const icon = status ? (
    <Icon
      name={status !== 'unavailable' ? 'checkmark' : 'close'}
      color={statusColors[status]}
      size="large"
    />
  ) : null;

  const onClick = selectable
    ? () => {
        if (status === 'available') {
          dispatch(setAnswer(timeslot, 'ifneedbe'));
        } else if (status === 'ifneedbe') {
          dispatch(setAnswer(timeslot, 'unavailable'));
        } else {
          dispatch(setAnswer(timeslot, 'available'));
        }
      }
    : null;

  return (
    <Table.Cell
      positive={positive}
      negative={negative}
      key={timeslot}
      textAlign="center"
      selectable={selectable}
      onClick={onClick}
    >
      {icon}
      {!unknown && hasBusyTimes && (
        <>
          <div className={styles['free-time']}></div>
          {busyPositions.map((style, i) => (
            <div key={i} className={styles['busy-time']} style={style}></div>
          ))}
        </>
      )}
    </Table.Cell>
  );
}

AnswerCell.propTypes = {
  participant: PropTypes.shape({
    answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
  }).isRequired,
  timeslot: PropTypes.string,
  answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
  hasBusyTimes: PropTypes.bool,
  busyTimes: PropTypes.object.isRequired,
  duration: PropTypes.number.isRequired,
  selectable: PropTypes.bool.isRequired,
  unknown: PropTypes.bool.isRequired,
};

function SummaryCell({
  participant,
  timeslot,
  interactive,
  hovered,
  active,
  onMouseEnter,
  onMouseLeave,
  hasAnswered,
}) {
  const status = participant.answers[timeslot];
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
    : hovered && interactive
    ? styles.hover
    : !interactive
    ? styles.finalized
    : null;

  return (
    <Table.Cell
      positive={positive}
      negative={negative}
      key={timeslot}
      textAlign="center"
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {icon}
    </Table.Cell>
  );
}

SummaryCell.propTypes = {
  participant: PropTypes.shape({
    answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
  }).isRequired,
  timeslot: PropTypes.string,
  interactive: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  hovered: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  hasAnswered: PropTypes.bool.isRequired,
};

function AnswerRow({
  participant,
  timeslots,
  answers,
  hasBusyTimes,
  busyTimes,
  duration,
  unknown,
  selectable,
}) {
  return (
    <Table.Row textAlign="center" className={selectable ? styles.selectable : null}>
      <NameCell participant={participant} highlighted={selectable} />
      {timeslots.map(timeslot => (
        <AnswerCell
          key={timeslot}
          timeslot={timeslot}
          participant={participant}
          answers={answers}
          hasBusyTimes={hasBusyTimes}
          busyTimes={busyTimes}
          duration={duration}
          selectable={selectable}
          unknown={unknown}
        />
      ))}
    </Table.Row>
  );
}

AnswerRow.propTypes = {
  participant: PropTypes.shape({
    answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
  }).isRequired,
  timeslots: PropTypes.array.isRequired,
  answers: PropTypes.object.isRequired,
  hasBusyTimes: PropTypes.bool,
  busyTimes: PropTypes.object,
  duration: PropTypes.number.isRequired,
  unknown: PropTypes.bool.isRequired,
  selectable: PropTypes.bool.isRequired,
};

function SummaryRow({
  participant,
  timeslots,
  interactive,
  finalDate,
  hoveredColumn,
  setHoveredColumn,
}) {
  const hasAnswered = Object.keys(participant.answers || []).length !== 0;

  return (
    <Table.Row textAlign="center">
      <NameCell participant={participant} />
      {timeslots.map(timeslot => (
        <SummaryCell
          key={timeslot}
          participant={participant}
          timeslot={timeslot}
          interactive={interactive}
          hovered={interactive && hoveredColumn === timeslot}
          active={interactive && finalDate === timeslot}
          onMouseEnter={interactive ? () => setHoveredColumn(timeslot) : null}
          onMouseLeave={interactive ? () => setHoveredColumn(null) : null}
          hasAnswered={hasAnswered}
        />
      ))}
    </Table.Row>
  );
}

SummaryRow.propTypes = {
  participant: PropTypes.shape({
    answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    comment: PropTypes.string,
  }).isRequired,
  timeslots: PropTypes.array.isRequired,
  interactive: PropTypes.bool.isRequired,
  finalDate: PropTypes.string,
  hoveredColumn: PropTypes.string,
  setHoveredColumn: PropTypes.func.isRequired,
};

function TableHeader({
  timeslots,
  interactive,
  finalDate,
  setFinalDate,
  isCreator,
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
            interactive={interactive}
            setFinalDate={setFinalDate}
            isCreator={isCreator}
            hovered={interactive && hoveredColumn === timeslot}
            active={interactive && finalDate === timeslot}
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
  interactive: PropTypes.bool.isRequired,
  finalDate: PropTypes.string,
  setFinalDate: PropTypes.func,
  isCreator: PropTypes.bool.isRequired,
  hoveredColumn: PropTypes.string,
  setHoveredColumn: PropTypes.func,
};

function TableFooter({
  participants,
  timeslots,
  interactive,
  finalDate,
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
            active={interactive && finalDate === timeslot}
            onMouseEnter={interactive ? () => setHoveredColumn(timeslot) : null}
            onMouseLeave={interactive ? () => setHoveredColumn(null) : null}
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
  hoveredColumn: PropTypes.string,
  setHoveredColumn: PropTypes.func,
};

export function AnswerGrid({
  participant,
  user,
  name,
  comment,
  unknown,
  hasBusyTimes,
  busyTimes,
  duration,
}) {
  const timeslots = useSelector(getNewdleTimeslots);
  let participants = useSelector(getNewdleParticipants);
  const answers = useSelector(getAnswers);

  if (timeslots.length === 0) {
    return null;
  }

  // Update the corresponding participant with the current comment and answers.
  // This makes sure that the comment popup and the 'AvailabilityRing' stay in sync.
  // If the participant does not exist yet,
  // a new one is inserted into the participant array.
  if (participant) {
    if (participants.some(p => p.id === participant.id)) {
      participants = participants.map(p => {
        if (p.id === participant.id) {
          return {...participant, comment, answers};
        } else {
          return p;
        }
      });
    } else {
      participants = [...participants, {...participant, comment, answers}];
    }
  } else if (user) {
    // user has not answered yet, create a new participant object for them
    participants = [
      ...participants,
      {
        id: -1,
        name: user.name,
        avatar_url: user.avatar_url,
        auth_uid: user.uid,
        comment,
        answers,
      },
    ];
  }

  participants = _.sortBy(participants, 'name');

  if (unknown) {
    // keep the unknown participant in the first table row
    participants = [
      {
        id: -1,
        name,
        comment,
        answers,
      },
      ...participants,
    ];
  }

  return (
    <div className={styles['answer-grid']}>
      <Table textAlign="center">
        <TableHeader timeslots={timeslots} interactive={false} isCreator={false} />
        <Table.Body>
          {participants.map(p => {
            const selectable = participant
              ? participant.id === p.id
              : user
              ? user.uid === p.auth_uid
              : p.id === -1;
            return (
              <AnswerRow
                key={p.id}
                participant={p}
                timeslots={timeslots}
                answers={answers}
                selectable={selectable}
                hasBusyTimes={hasBusyTimes}
                busyTimes={busyTimes}
                duration={duration}
                unknown={unknown && selectable}
              />
            );
          })}
        </Table.Body>
        <TableFooter participants={participants} timeslots={timeslots} interactive={false} />
      </Table>
    </div>
  );
}

AnswerGrid.propTypes = {
  participant: PropTypes.object,
  user: PropTypes.object,
  name: PropTypes.string,
  comment: PropTypes.string,
  unknown: PropTypes.bool.isRequired,
  hasBusyTimes: PropTypes.bool,
  busyTimes: PropTypes.object.isRequired,
  duration: PropTypes.number.isRequired,
};

export function ParticipantGrid({finalDate, setFinalDate, isCreator, finalized}) {
  const timeslots = useSelector(getNewdleTimeslots);
  const participants = useSelector(getNewdleParticipants);
  const [hoveredColumn, setHoveredColumn] = useState(null);

  if (timeslots.length === 0) {
    return null;
  }

  return (
    <div className={styles['participant-grid']}>
      <Table textAlign="center">
        <TableHeader
          timeslots={timeslots}
          interactive={!finalized}
          finalDate={finalDate}
          setFinalDate={setFinalDate}
          isCreator={isCreator}
          hoveredColumn={hoveredColumn}
          setHoveredColumn={setHoveredColumn}
        />
        <Table.Body>
          {_.sortBy(participants, ['name']).map(participant => (
            <SummaryRow
              key={participant.id}
              participant={participant}
              timeslots={timeslots}
              interactive={!finalized}
              finalDate={finalDate}
              hoveredColumn={hoveredColumn}
              setHoveredColumn={setHoveredColumn}
            />
          ))}
        </Table.Body>
        <TableFooter
          participants={participants}
          timeslots={timeslots}
          interactive={!finalized}
          finalDate={finalDate}
          hoveredColumn={hoveredColumn}
          setHoveredColumn={setHoveredColumn}
        />
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
