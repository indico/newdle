import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Icon, Input, Popup} from 'semantic-ui-react';
import styles from './Timeline.module.scss';

export default function Slot({width, pos, moreStyles, onClick, children}) {
  return (
    <div
      onClick={onClick}
      className={`${styles['slot']} ${moreStyles}`}
      style={{left: `${pos}%`, width: `${width}%`}}
    >
      {children}
    </div>
  );
}

Slot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  moreStyles: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

Slot.defaultProps = {
  moreStyles: '',
  onClick: null,
  children: null,
};

export function CandidateSlot({width, pos, startTime, onDelete, onChangeSlotTime, canEdit}) {
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
      className={styles['time-input']}
      type="time"
      action={{
        icon: 'check',
        disabled: !hasChanged || !value || !canEdit(value),
        onClick: () => {
          onChangeSlotTime(value);
        },
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
};
