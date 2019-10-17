import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';

import styles from './DayCarousel.module.scss';

export default function DayCarousel({items, numberOfVisible, start, step, renderItem, changeItem}) {
  const next = () => {
    const newIndex = (start + step) % items.length;
    if (changeItem) {
      changeItem(items[newIndex]);
    }
  };

  const prev = () => {
    const newIndex = Math.max(start - step, 0);
    if (changeItem) {
      changeItem(items[newIndex]);
    }
  };

  let showPrevBtn, showNextBtn, fromIndex, toIndex;

  if (numberOfVisible >= items.length) {
    showPrevBtn = showNextBtn = false;
    fromIndex = 0;
    toIndex = items.length;
  } else {
    showPrevBtn = start !== 0;
    showNextBtn = start + numberOfVisible < items.length;
    fromIndex = Math.min(items.length - numberOfVisible, start);
    toIndex = start + numberOfVisible;
  }

  return (
    <>
      {showPrevBtn && (
        <Icon size="big" name="angle left" onClick={prev} className={styles['prev-icon']} />
      )}
      {showNextBtn && (
        <Icon size="big" name="angle right" onClick={next} className={styles['next-icon']} />
      )}
      {items.slice(fromIndex, toIndex).map(renderItem)}
    </>
  );
}

DayCarousel.propTypes = {
  items: PropTypes.array.isRequired,
  numberOfVisible: PropTypes.number,
  start: PropTypes.number,
  step: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  changeItem: PropTypes.func,
};

DayCarousel.defaultProps = {
  numberOfVisible: 3,
  start: 0,
  step: 1,
  changeItem: null,
};
