import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router';
import {t} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Message, TransitionablePortal} from 'semantic-ui-react';
import {clearError, removeError} from '../actions';
import styles from './ErrorMessage.module.scss';

export default function ErrorMessage({id, error}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // TODO - find out how to do this in react-router 6
  // useEffect(() => {
  //   // Remove the callback defined with `listen` once the component gets unmounted
  //   return history.listen(() => {
  //     dispatch(clearError());
  //   });
  // }, [dispatch, navigate]);

  return (
    <TransitionablePortal
      closeOnDocumentClick={false}
      transition={{animation: 'scale', duration: 1000}}
      transitionOnMount
      open
    >
      <Message
        className={styles['error-message']}
        header={t`Error occurred`}
        content={error}
        onClick={() => dispatch(removeError(id))}
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
