import React from 'react';
import {useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';
import styles from './answer.module.scss';

export default function Option({
  startTime,
  endTime,
  icon,
  action,
  className,
  taken,
  styles: moreStyles,
}) {
  const dispatch = useDispatch();

  return (
    <div
      className={`${styles.option} ${className}`}
      onClick={taken ? null : () => dispatch(action())}
      style={{...moreStyles, cursor: taken ? 'inherit' : 'pointer'}}
    >
      <span className={styles.times}>
        {startTime} - {endTime}
      </span>
      <Icon name={!taken ? icon : 'ban'} />
    </div>
  );
}

Option.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  action: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  styles: PropTypes.object,
  taken: PropTypes.bool.isRequired,
};

Option.defaultProps = {
  onClick: null,
  styles: {},
};
