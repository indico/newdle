import React, {useState} from 'react';
import PropTypes from 'prop-types';
import TimePicker from 'rc-time-picker';
import {Icon, Button, Popup} from 'semantic-ui-react';
import {toMoment, DEFAULT_TIME_FORMAT} from '../../../util/date';
import Slot from './Slot';
import 'rc-time-picker/assets/index.css';
import styles from './Timeline.module.scss';

function SlotEditWidget({startTime, onChange, isValidTime, slot}) {
  const [timeslotTime, setTimeslotTime] = useState(startTime);
  const changed = timeslotTime !== startTime;
  const canSave = changed && timeslotTime && isValidTime(timeslotTime);

  return (
    <Popup
      className={styles['timepicker-popup']}
      on="click"
      content={
        <>
          <TimePicker
            showSecond={false}
            value={toMoment(timeslotTime, DEFAULT_TIME_FORMAT)}
            format={DEFAULT_TIME_FORMAT}
            onChange={time => setTimeslotTime(time ? time.format(DEFAULT_TIME_FORMAT) : null)}
            allowEmpty={false}
            // keep the picker in the DOM tree of the surrounding element
            getPopupContainer={node => node}
          />
          <Button
            icon
            onClick={() => {
              onChange(timeslotTime);
            }}
            disabled={!canSave}
          >
            <Icon name="check" />
          </Button>
        </>
      }
      trigger={slot}
      position="bottom center"
      onKeyDown={evt => {
        if (evt.key === 'Enter' && canSave) {
          onChange(timeslotTime);
        }
      }}
    />
  );
}

SlotEditWidget.propTypes = {
  startTime: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isValidTime: PropTypes.func.isRequired,
  slot: PropTypes.node.isRequired,
};

export default function CandidateSlot({
  width,
  pos,
  startTime,
  endTime,
  onDelete,
  onChangeSlotTime,
  isValidTime,
  text,
}) {
  const slot = (
    <Slot
      width={width}
      pos={pos}
      moreStyles={styles['candidate']}
      tooltip={
        <div style={{textAlign: 'center'}}>
          <span>{`${startTime} - ${endTime}`}</span>
          <p>{text}</p>
        </div>
      }
    >
      <Icon
        name="times circle outline"
        onClick={onDelete}
        className={`${styles['clickable']} ${styles['delete-btn']}`}
      />
    </Slot>
  );
  return (
    <SlotEditWidget
      startTime={startTime}
      onChange={onChangeSlotTime}
      isValidTime={isValidTime}
      slot={slot}
    />
  );
}

CandidateSlot.propTypes = {
  width: PropTypes.number.isRequired,
  pos: PropTypes.number.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChangeSlotTime: PropTypes.func.isRequired,
  isValidTime: PropTypes.func.isRequired,
  text: PropTypes.string,
};
