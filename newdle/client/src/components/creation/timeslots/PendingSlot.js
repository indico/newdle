import React from 'react';
import styles from './Timeline.module.scss';
import {Placeholder} from 'semantic-ui-react';

export default function PendingSlot() {
  return <Placeholder className={`${styles['slot']} ${styles['pending']}`} />;
}
