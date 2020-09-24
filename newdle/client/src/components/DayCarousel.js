import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';

import styles from './DayCarousel.module.scss';

export default function DayCarousel({
  items,
  numberOfVisible,
  activeIndex,
  activePosition,
  step,
  renderItem,
  changeItem,
}) {
  const next = () => {
    const newIndex = (activeIndex + step) % items.length;
    const nextPosition =
      activePosition + step < numberOfVisible ? activePosition + step : numberOfVisible - 1;
    if (changeItem) {
      changeItem(items[newIndex], nextPosition);
    }
  };

  const prev = () => {
    const newIndex = Math.max(activeIndex - step, 0);
    const nextPosition = activePosition - step >= 0 ? activePosition - step : 0;
    if (changeItem) {
      changeItem(items[newIndex], nextPosition);
    }
  };

  let showPrevBtn, showNextBtn, fromIndex, toIndex;

  if (numberOfVisible >= items.length) {
    showPrevBtn = showNextBtn = false;
    fromIndex = 0;
    toIndex = items.length;
  } else {
    showPrevBtn = activeIndex !== 0;
    showNextBtn = activeIndex < items.length - 1;
    fromIndex = activeIndex - activePosition < 0 ? 0 : activeIndex - activePosition;
    toIndex = activeIndex + (numberOfVisible - activePosition);
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
  activeIndex: PropTypes.number,
  activePosition: PropTypes.number,
  step: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  changeItem: PropTypes.func,
};

DayCarousel.defaultProps = {
  numberOfVisible: 3,
  activeIndex: 0,
  activePosition: 0,
  step: 1,
  changeItem: null,
};
