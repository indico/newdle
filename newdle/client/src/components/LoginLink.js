import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {isLoggedIn} from '../selectors';
import {useAuthentication} from '../auth';
import {useRouter} from '../util/router';

export default function LoginLink({children, ...props}) {
  const isUserLoggedIn = useSelector(isLoggedIn);
  const {login} = useAuthentication();
  const router = useRouter();
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (isUserLoggedIn && loggingIn) {
      setLoggingIn(false);
      const method = props.replace ? router.history.replace : router.history.push;
      method(props.to);
    }
  }, [isUserLoggedIn, router, loggingIn, props.replace, props.to]);

  return (
    <Link
      {...props}
      onClick={evt => {
        if (isUserLoggedIn) {
          // use the normal Link logic if logged-in
          return;
        }
        evt.preventDefault();
        setLoggingIn(true);
        login({replace: props.replace, to: props.to});
      }}
    >
      {children}
    </Link>
  );
}

LoginLink.propTypes = Link.propTypes;
