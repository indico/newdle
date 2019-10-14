import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';

import styles from './DayCarousel.module.scss';

export default function DayCarousel({items, numberOfVisible, start, step, renderItem, changeItem}) {
  const next = () => {
    const newIndex = (start + step) % items.length;
    changeItem(items[newIndex]);
  };

  const prev = () => {
    const newIndex = Math.max(start - step, 0);
    changeItem(items[newIndex]);
  };

  return (
    <>
      {start !== 0 && (
        <Icon size="big" name="angle left" onClick={prev} className={styles['prev-icon']} />
      )}
      {start + numberOfVisible <= items.length + 1 && (
        <Icon size="big" name="angle right" onClick={next} className={styles['next-icon']} />
      )}
      {items.slice(start, start + numberOfVisible).map(renderItem)}
    </>
  );
}

DayCarousel.propTypes = {
  items: PropTypes.array.isRequired,
  numberOfVisible: PropTypes.number,
  start: PropTypes.number,
  step: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
};

DayCarousel.defaultProps = {
  numberOfVisible: 3,
  start: 0,
  step: 1,
};
