import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Icon, Input, Popup} from 'semantic-ui-react';
import Slot from './Slot';
import styles from './Timeline.module.scss';

function SlotEditWidget({startTime, onChange, isValidTime}) {
  const [value, setValue] = useState(startTime);
  const changed = value !== startTime;
  const canSave = changed && value && isValidTime(value);

  const handleInputChange = evt => {
    setValue(evt.target.value);
  };

  return (
    <Input
      autoFocus
      className={styles['time-input']}
      type="time"
      action={{
        icon: 'check',
        disabled: !canSave,
        onClick: () => {
          onChange(value);
        },
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' && canSave) {
          onChange(value);
        }
      }}
      onChange={handleInputChange}
      value={value}
    />
  );
}

export default function CandidateSlot({
  width,
  pos,
  startTime,
  onDelete,
  onChangeSlotTime,
  isValidTime,
}) {
  const slot = (
    <Slot width={width} pos={pos} moreStyles={styles['candidate']}>
      <Icon
        name="times circle outline"
        onClick={onDelete}
        className={`${styles['clickable']} ${styles['delete-btn']}`}
      />
    </Slot>
  );
  return (
    <Popup
      on="click"
      content={
        <SlotEditWidget
          startTime={startTime}
          onChange={onChangeSlotTime}
          isValidTime={isValidTime}
        />
      }
      trigger={slot}
      position="bottom center"
    />
  );
}

CandidateSlot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  startTime: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChangeSlotTime: PropTypes.func.isRequired,
  isValidTime: PropTypes.func.isRequired,
};
