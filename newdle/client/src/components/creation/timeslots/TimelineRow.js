import React from 'react';
import PropTypes from 'prop-types';
import UserAvatar from '../../UserAvatar';
import PendingSlot from './PendingSlot';
import Slot from './Slot';
import styles from './Timeline.module.scss';
import {useIsSmallScreen} from 'src/util/hooks';

export default function TimelineRow({participant, busySlots, busySlotsLoading}) {
  const isTabletOrMobile = useIsSmallScreen();

  return (
    <div className={styles['timeline-row']}>
      <span
        className={isTabletOrMobile ? styles['timeline-row-nolabel'] : styles['timeline-row-label']}
      >
        <UserAvatar
          user={participant}
          className={styles['avatar']}
          size={30}
          withLabel={!isTabletOrMobile}
        />
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
