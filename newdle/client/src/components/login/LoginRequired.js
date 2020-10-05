import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {useAuthentication} from '../../auth';
import {isLoggedIn} from '../../selectors';

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
