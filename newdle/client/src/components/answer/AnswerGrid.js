import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import {Icon, Table} from 'semantic-ui-react';
import {setAnswer} from '../../actions';
import {getAnswers} from '../../answerSelectors';
import {getNewdleParticipants, getNewdleTimeslots} from '../../selectors';
import {toMoment} from '../../util/date';
import {NameCell, TableHeader, TableFooter} from '../GridCommon';
import styles from '../GridCommon.module.scss';

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

export default function AnswerGrid({
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
