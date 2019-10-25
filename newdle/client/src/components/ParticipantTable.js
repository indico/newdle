import React, {useState} from 'react';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {Radio, Icon, Label, Table} from 'semantic-ui-react';
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import {serializeDate, toMoment} from '../util/date';
import {getNewdleDuration, getNumberOfParticipants, getParticipantAvailability} from '../selectors';
import 'react-circular-progressbar/dist/styles.css';
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

  if (participants.length === 0) {
    return 'Nobody is available at this time';
  }

  const renderName = ({auth_uid, name, fullyAvailable}) => (
    <div key={auth_uid || name} className={styles['user-element']}>
      <Icon
        name="checkmark"
        color={fullyAvailable ? 'green' : 'yellow'}
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

function AvailabilityRow({availability: {startDt, available}, setActiveDate, active}) {
  const numberOfParticipants = useSelector(getNumberOfParticipants);
  const duration = useSelector(getNewdleDuration);
  const startTime = toMoment(startDt, 'YYYY-MM-DDTHH:mm');

  return (
    <Table.Row
      className={styles['participant-row']}
      onClick={() => setActiveDate(startDt)}
      active={active}
    >
      <Table.Cell width={4}>
        <div className={styles['date']}>{startTime.format('D MMM')}</div>
        <div className={styles['time']}>{formatMeetingTime(startTime, duration)}</div>
      </Table.Cell>
      <span>
        <Table.Cell className={styles['available-participants']} textAlign="left">
          <div className={styles['wrapper']}>
            <div className={styles['availability-indicator']}>
              <CircularProgressbar
                value={available.length}
                text={`${available.length} / ${numberOfParticipants}`}
                maxValue={numberOfParticipants}
                styles={buildStyles({
                  textSize: '18px',
                  strokeLinecap: 'butt',
                  pathColor: numberOfParticipants === 0 ? 'gray' : 'lightgreen',
                  trailColor: 'red',
                  textColor: 'black',
                })}
              />
            </div>
            <div className={styles['participants']}>
              {available.length > 0 && (
                <div className={styles['count']}>
                  <Label color="green">
                    <Icon name="calendar check" /> {available.length} available participants
                  </Label>
                </div>
              )}
              <ParticipantNames participants={available} />
            </div>
          </div>
        </Table.Cell>
        <Table.Cell textAlign="right" className={styles['radio-button-cell']}>
          <Radio name="slot-id" value={startDt} checked={active} />
        </Table.Cell>
      </span>
    </Table.Row>
  );
}

export default function ParticipantTable({finalDate, setFinalDate}) {
  const availabilityData = useSelector(getParticipantAvailability);

  if (availabilityData.length === 0) {
    return null;
  }

  return (
    <div className={styles['participant-table']}>
      <Table textAlign="center" definition selectable>
        <Table.Body>
          {availabilityData.map(availability => (
            <AvailabilityRow
              key={availability.startDt}
              availability={availability}
              setActiveDate={setFinalDate}
              active={availability.startDt === finalDate}
            />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
