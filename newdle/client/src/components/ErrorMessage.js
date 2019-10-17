import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import {useHistory} from 'react-router';
import {Container, Message} from 'semantic-ui-react';
import {clearError} from '../actions';

export default function ErrorMessage({error}) {
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    // Remove the callback defined with `listen` once the component gets unmounted
    return history.listen(() => {
      dispatch(clearError());
    });
  }, [dispatch, history]);

  return (
    <Container text>
      <Message header="Error occurred" content={error} icon="exclamation triangle" error />
    </Container>
  );
}

ErrorMessage.propTypes = {
  error: PropTypes.string.isRequired,
};
