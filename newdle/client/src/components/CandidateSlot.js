import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Icon, Input, Popup} from 'semantic-ui-react';
import Slot from './Slot';
import styles from './Timeline.module.scss';

export default function CandidateSlot({
  width,
  pos,
  startTime,
  onDelete,
  onChangeSlotTime,
  isValidTime,
}) {
  const [value, setValue] = useState(startTime);
  const [hasChanged, setHasChanged] = useState(false);

  const handleInputChange = e => {
    const changed = e.target.value !== value;
    setHasChanged(changed);
    if (changed) {
      setValue(e.target.value);
    }
  };
  const slot = (
    <Slot width={width} pos={pos} moreStyles={styles['candidate']}>
      <Icon
        name="times circle outline"
        onClick={onDelete}
        className={`${styles['clickable']} ${styles['delete-btn']}`}
      />
    </Slot>
  );
  const content = (
    <Input
      autoFocus
      className={styles['time-input']}
      type="time"
      action={{
        icon: 'check',
        disabled: !hasChanged || !value || !isValidTime(value),
        onClick: () => {
          onChangeSlotTime(value);
        },
      }}
      onKeyDown={e => {
        const canChange = hasChanged && value && isValidTime(value);
        if (e.key === 'Enter' && canChange) {
          onChangeSlotTime(value);
        }
      }}
      onChange={handleInputChange}
      defaultValue={value}
    />
  );
  return <Popup on="click" content={content} trigger={slot} position="bottom center" />;
}

CandidateSlot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  startTime: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChangeSlotTime: PropTypes.func.isRequired,
  isValidTime: PropTypes.func.isRequired,
};
