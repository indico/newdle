import React from 'react';
import PropTypes from 'prop-types';
import UserAvatar from '../../UserAvatar';
import PendingSlot from './PendingSlot';
import Slot from './Slot';
import styles from './Timeline.module.scss';

export default function TimelineRow({participant, busySlots, busySlotsLoading}) {
  return (
    <div className={styles['timeline-row']}>
      <span className={styles['timeline-row-label']}>
        <UserAvatar user={participant} className={styles['avatar']} size={30} withLabel />
      </span>
      <div className={styles['timeline-busy']}>
        {busySlotsLoading ? (
          <PendingSlot />
        ) : (
          busySlots.map(slot => (
            <Slot key={slot.key} {...slot} tooltip={`${slot.startTime} - ${slot.endTime}`} />
          ))
        )}
      </div>
    </div>
  );
}

TimelineRow.propTypes = {
  participant: PropTypes.object.isRequired,
  busySlots: PropTypes.array.isRequired,
  busySlotsLoading: PropTypes.bool,
};
