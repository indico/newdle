import React from 'react';
import {Placeholder} from 'semantic-ui-react';
import styles from './Timeline.module.scss';

export default function PendingSlot() {
  return <Placeholder className={`${styles['slot']} ${styles['pending']}`} />;
}
