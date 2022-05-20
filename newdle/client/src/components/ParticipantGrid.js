import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {Table, Icon} from 'semantic-ui-react';
import {
  getNewdleDuration,
  getNewdleParticipants,
  getNewdleTimeslots,
  getNewdleTimezone,
} from '../selectors';
import {NameCell, TableHeader, TableFooter} from './GridCommon';
import styles from './GridCommon.module.scss';

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
    : hovered
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
          active={finalDate === timeslot}
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

export default function ParticipantGrid({finalDate, setFinalDate, isCreator, finalized}) {
  const timeslots = useSelector(getNewdleTimeslots);
  const participants = useSelector(getNewdleParticipants);
  const newdleTz = useSelector(getNewdleTimezone);
  const newdleDuration = useSelector(getNewdleDuration);
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
          newdleTz={newdleTz}
          newdleDuration={newdleDuration}
        />
        <Table.Body>
          {_.sortBy(participants, 'name').map(participant => (
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
