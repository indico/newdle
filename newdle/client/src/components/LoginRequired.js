import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {isLoggedIn} from '../selectors';
import {useAuthentication} from '../auth';

export default function LoginRequired({component: Component, onClick, ...props}) {
  const isUserLoggedIn = useSelector(isLoggedIn);
  const {login} = useAuthentication();
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (isUserLoggedIn && loggingIn) {
      setLoggingIn(false);
      onClick();
    }
  }, [isUserLoggedIn, loggingIn, onClick]);

  return (
    <Component
      {...props}
      onClick={evt => {
        evt.preventDefault();
        if (isUserLoggedIn) {
          onClick();
        } else {
          setLoggingIn(true);
          login();
        }
      }}
    />
  );
}

LoginRequired.propTypes = {
  component: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
};
