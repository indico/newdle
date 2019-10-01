import React from 'react';
import {Modal} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {isAcquiringToken, isLoggedIn} from '../../selectors';
import {useAuthentication} from '../../auth';
import {loginPromptAborted} from '../../actions';

export default function LoginPrompt() {
  const acquiringToken = useSelector(isAcquiringToken);
  const loggedIn = useSelector(isLoggedIn);
  const {login, logout} = useAuthentication();
  const history = useHistory();
  const dispatch = useDispatch();

  if (!acquiringToken) {
    return null;
  } else if (loggedIn) {
    // refreshing expired token
    return (
      <Modal
        open
        size="mini"
        header="Your session expired"
        content="Please log in again to confirm your identity"
        actions={[
          {key: 'login', content: 'Login', positive: true, onClick: login},
          {key: 'logout', content: 'Logout', onClick: logout},
        ]}
      />
    );
  } else {
    // (fresh) login required
    return (
      <Modal
        open
        size="mini"
        header="Login required"
        content="You need to log in to access this page"
        actions={[
          {key: 'login', content: 'Login', positive: true, onClick: login},
          {
            key: 'cancel',
            content: 'Cancel',
            onClick: () => {
              history.push('/');
              dispatch(loginPromptAborted());
            },
          },
        ]}
      />
    );
  }
}
