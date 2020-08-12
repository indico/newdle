import React, {useState} from 'react';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {Radio, Icon, Label, Table} from 'semantic-ui-react';
import AvailabilityRing from './AvailabilityRing';
import {serializeDate, toMoment} from '../util/date';
import {getNewdleDuration, getNumberOfParticipants, getParticipantAvailability} from '../selectors';
import styles from './ParticipantTable.module.scss';

const MAX_PARTICIPANTS_SHOWN = 4;

function formatMeetingTime(startTime, duration) {
  const endTime = moment(startTime)
    .add(duration, 'm')
    .format('HH:mm');
  return `${serializeDate(startTime, 'HH:mm')} - ${endTime}`;
}

function ParticipantNames({participants}) {
  const [renderAll, setRenderAll] = useState(false);
  const statusColors = {available: 'green', ifneedbe: 'yellow', unavailable: 'red'};

  if (participants.length === 0) {
    return 'Nobody has voted yet.';
  }

  const renderName = ({auth_uid, name, status}) => (
    <div key={auth_uid || name} className={styles['user-element']}>
      <Icon
        name={status !== 'unavailable' ? 'checkmark' : 'close'}
        color={statusColors[status]}
        size="tiny"
        circular
        inverted
      />
      {name}
    </div>
  );

  if (renderAll || participants.length <= MAX_PARTICIPANTS_SHOWN) {
    return participants.map(renderName);
  } else {
    return (
      <>
        {participants.slice(0, MAX_PARTICIPANTS_SHOWN).map(renderName)}
        <Label
          className={styles['more-participants']}
          color="blue"
          onClick={evt => {
            evt.stopPropagation();
            setRenderAll(true);
          }}
          circular
        >
          {`+${participants.length - MAX_PARTICIPANTS_SHOWN} more`}
        </Label>
      </>
    );
  }
}

function AvailabilityRow({
  availability: {startDt, participants, availableCount, unavailableCount},
  setActiveDate,
  active,
  finalized,
  children,
}) {
  const numberOfParticipants = useSelector(getNumberOfParticipants);
  const duration = useSelector(getNewdleDuration);
  const startTime = toMoment(startDt, 'YYYY-MM-DDTHH:mm');

  return (
    <Table.Row
      className={
        finalized
          ? `${styles['participant-row']} ${styles['finalized']}`
          : styles['participant-row']
      }
      style={!finalized || active ? null : {opacity: '0.3'}}
      onClick={() => (finalized ? null : setActiveDate(startDt))}
      active={active}
    >
      <Table.Cell width={3}>
        <div className={styles['date']}>{startTime.format('D MMM')}</div>
        <div className={styles['time']}>{formatMeetingTime(startTime, duration)}</div>
      </Table.Cell>
      <Table.Cell width={10} className={styles['available-participants']} textAlign="left">
        <div className={styles['wrapper']}>
          <div className={styles['availability-indicator']}>
            <AvailabilityRing
              available={participants.filter(p => p.status === 'available').length}
              ifNeeded={participants.filter(p => p.status === 'ifneedbe').length}
              unavailable={unavailableCount}
              totalParticipants={numberOfParticipants}
            />
          </div>
          <div className={styles['participants']}>
            {availableCount > 0 && (
              <div className={styles['count']}>
                <Label color="green">
                  <Icon name="calendar check" /> {availableCount} available participants
                </Label>
              </div>
            )}
            {numberOfParticipants ? (
              <ParticipantNames participants={participants} />
            ) : (
              <>There are no participants yet.</>
            )}
          </div>
        </div>
        {active && children}
      </Table.Cell>
      {!finalized && (
        <Table.Cell width={1} textAlign="right">
          <Radio name="slot-id" value={startDt} checked={active} />
        </Table.Cell>
      )}
    </Table.Row>
  );
}

export default function ParticipantTable({finalDate, setFinalDate, finalized, children}) {
  const availabilityData = useSelector(getParticipantAvailability);

  if (availabilityData.length === 0) {
    return null;
  }

  return (
    <div className={styles['participant-table']}>
      <Table textAlign="center" definition selectable={!finalized}>
        <Table.Body>
          {availabilityData.map(availability => (
            <AvailabilityRow
              key={availability.startDt}
              availability={availability}
              setActiveDate={setFinalDate}
              active={availability.startDt === finalDate}
              finalized={finalized}
            >
              {children}
            </AvailabilityRow>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
