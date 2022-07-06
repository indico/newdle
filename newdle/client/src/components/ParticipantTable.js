import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {Plural, t} from '@lingui/macro';
import moment from 'moment';
import PropTypes from 'prop-types';
import {Radio, Icon, Label, Table} from 'semantic-ui-react';
import {
  getNewdleDuration,
  getNewdleTimezone,
  getNumberOfParticipants,
  getParticipantAvailability,
} from '../selectors';
import {serializeDate, toMoment} from '../util/date';
import {useIsMobile} from '../util/hooks';
import AvailabilityRing from './AvailabilityRing';
import styles from './ParticipantTable.module.scss';

const MAX_PARTICIPANTS_SHOWN = 4;

function formatMeetingTime(startTime, duration) {
  const endTime = moment(startTime).add(duration, 'm').format('HH:mm');
  return `${serializeDate(startTime, 'HH:mm')} - ${endTime}`;
}

function ParticipantNames({participants}) {
  const [renderAll, setRenderAll] = useState(false);
  const statusColors = {available: 'green', ifneedbe: 'yellow', unavailable: 'red'};

  // eslint-disable-next-line react/prop-types
  const renderName = ({name, comment, status, id}) => (
    <div key={id} className={styles['user-element']}>
      <Icon
        name={status !== 'unavailable' ? 'checkmark' : 'close'}
        color={statusColors[status]}
        size="tiny"
        circular
        inverted
      />
      {name}
      <p className={styles['comment']}>{comment}</p>
    </div>
  );

  // allow to exceed max by 1 since the "show +1" button takes the same space
  // as actually showing the participant name
  if (renderAll || participants.length <= MAX_PARTICIPANTS_SHOWN + 1) {
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
          <Plural
            value={participants.length - MAX_PARTICIPANTS_SHOWN}
            one={`+# more`}
            other={`+# more`}
          />
        </Label>
      </>
    );
  }
}

ParticipantNames.propTypes = {
  participants: PropTypes.array.isRequired,
};

function AvailabilityRow({
  availability: {startDt, participants, availableCount, unavailableCount},
  setActiveDate,
  active,
  finalized,
  isCreator,
  children,
}) {
  const numberOfParticipants = useSelector(getNumberOfParticipants);
  const newdleTimezone = useSelector(getNewdleTimezone);
  const duration = useSelector(getNewdleDuration);
  const startTime = toMoment(startDt, 'YYYY-MM-DDTHH:mm');

  const isMobile = useIsMobile();
  const renderParticipants = () => {
    if (!numberOfParticipants) {
      return t`There are no participants yet.`;
    } else if (participants.length === 0) {
      return t`Nobody has voted yet.`;
    } else if (!isMobile || active) {
      return <ParticipantNames participants={participants} />;
    }
    return null;
  };

  return (
    <Table.Row
      className={
        finalized || !isCreator
          ? `${styles['participant-row']} ${styles['finalized']}`
          : styles['participant-row']
      }
      style={!finalized || active ? null : {opacity: '0.3'}}
      onClick={() => (finalized || (!isMobile && !isCreator) ? null : setActiveDate(startDt))}
      active={active}
    >
      <Table.Cell width={3}>
        {isMobile ? (
          <div className={styles['availability-box']}>
            <div className={styles['availability-indicator']}>
              <AvailabilityRing
                available={participants.filter(p => p.status === 'available').length}
                ifNeeded={participants.filter(p => p.status === 'ifneedbe').length}
                unavailable={unavailableCount}
                totalParticipants={numberOfParticipants}
              />
            </div>
            <div>
              <div className={styles['date']}>{startTime.format('D MMM')}</div>
              <div className={styles['time']}>{formatMeetingTime(startTime, duration)}</div>
              <div className={styles['timezone']}>{newdleTimezone}</div>
            </div>
            {!finalized && isCreator && <Radio name="slot-id" value={startDt} checked={active} />}
          </div>
        ) : (
          <>
            <div className={styles['date']}>{startTime.format('D MMM')}</div>
            <div className={styles['time']}>{formatMeetingTime(startTime, duration)}</div>
            <div className={styles['timezone']}>({newdleTimezone})</div>
          </>
        )}
      </Table.Cell>
      <Table.Cell width={10} className={styles['available-participants']} textAlign="left">
        <div className={styles['wrapper']}>
          {!isMobile && (
            <div className={styles['availability-indicator']}>
              <AvailabilityRing
                available={participants.filter(p => p.status === 'available').length}
                ifNeeded={participants.filter(p => p.status === 'ifneedbe').length}
                unavailable={unavailableCount}
                totalParticipants={numberOfParticipants}
              />
            </div>
          )}
          <div className={styles['participants']}>
            <div className={styles['count']}>
              <Label color={availableCount > 0 ? 'green' : 'grey'}>
                <Icon name={`calendar ${availableCount > 0 ? 'check' : 'times'}`} />{' '}
                <Plural
                  value={availableCount}
                  one={`# available participant`}
                  other={`# available participants`}
                />
              </Label>
            </div>
            {renderParticipants()}
          </div>
        </div>
        {active && children}
      </Table.Cell>
      {!finalized && isCreator && !isMobile && (
        <Table.Cell width={1} textAlign="right">
          <Radio name="slot-id" value={startDt} checked={active} />
        </Table.Cell>
      )}
    </Table.Row>
  );
}

AvailabilityRow.propTypes = {
  availability: PropTypes.shape({
    startDt: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        answers: PropTypes.objectOf(PropTypes.oneOf(['unavailable', 'available', 'ifneedbe'])),
        auth_uid: PropTypes.string,
        email: PropTypes.string,
        name: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
      })
    ).isRequired,
    availableCount: PropTypes.number.isRequired,
    unavailableCount: PropTypes.number.isRequired,
  }).isRequired,
  setActiveDate: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  finalized: PropTypes.bool.isRequired,
  isCreator: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

AvailabilityRow.defaultProps = {
  children: null,
};

export default function ParticipantTable({
  finalDate,
  setFinalDate,
  finalized,
  isCreator,
  children,
}) {
  const availabilityData = useSelector(getParticipantAvailability);
  const isMobile = useIsMobile();

  if (availabilityData.length === 0) {
    return null;
  }

  return (
    <div className={styles['participant-table']}>
      <Table textAlign="center" definition={!isMobile} selectable={!finalized && isCreator}>
        <Table.Body>
          {availabilityData.map(availability => (
            <AvailabilityRow
              key={availability.startDt}
              availability={availability}
              setActiveDate={setFinalDate}
              active={availability.startDt === finalDate}
              finalized={finalized}
              isCreator={isCreator}
            >
              {children}
            </AvailabilityRow>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

ParticipantTable.propTypes = {
  finalDate: PropTypes.string,
  setFinalDate: PropTypes.func.isRequired,
  finalized: PropTypes.bool.isRequired,
  isCreator: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

ParticipantTable.defaultProps = {
  finalDate: null,
  children: null,
};
