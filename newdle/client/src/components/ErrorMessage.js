import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import {useHistory} from 'react-router';
import {Message, TransitionablePortal} from 'semantic-ui-react';
import {clearError, removeError} from '../actions';

import styles from './ErrorMessage.module.scss';

export default function ErrorMessage({id, error}) {
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    // Remove the callback defined with `listen` once the component gets unmounted
    return history.listen(() => {
      dispatch(clearError());
    });
  }, [dispatch, history]);

  return (
    <TransitionablePortal
      closeOnDocumentClick={false}
      transition={{animation: 'scale', duration: 1000}}
      transitionOnMount
      open
    >
      <Message
        className={styles['error-message']}
        header="Error occurred"
        content={error}
        onDismiss={() => dispatch(removeError(id))}
        error
      />
    </TransitionablePortal>
  );
}

ErrorMessage.propTypes = {
  id: PropTypes.number.isRequired,
  error: PropTypes.string.isRequired,
};
