import React from 'react';
import PropTypes from 'prop-types';
import UserAvatar from './UserAvatar';
import Slot from './Slot';
import styles from './Timeline.module.scss';

export default function TimelineRow({participant, busySlots}) {
  return (
    <div className={styles['timeline-row']}>
      <span className={styles['timeline-row-label']}>
        <UserAvatar user={participant} className={styles['avatar']} size={30} withLabel />
      </span>
      <div className={styles['timeline-busy']}>
        {busySlots.map(slot => (
          <Slot {...slot} />
        ))}
      </div>
    </div>
  );
}

TimelineRow.propTypes = {
  participant: PropTypes.object.isRequired,
  busySlots: PropTypes.array.isRequired,
};
