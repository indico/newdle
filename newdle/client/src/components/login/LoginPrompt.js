import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {t} from '@lingui/macro';
import {Modal} from 'semantic-ui-react';
import {loginPromptAborted} from '../../actions';
import {useAuthentication} from '../../auth';
import {isAcquiringToken, isLoggedIn} from '../../selectors';

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
        header={t`Your session expired`}
        content={t`Please log in again to confirm your identity`}
        actions={[
          {key: 'login', content: t`Login`, positive: true, onClick: login},
          {key: 'logout', content: t`Logout`, onClick: logout},
        ]}
      />
    );
  } else {
    // (fresh) login required
    return (
      <Modal
        open
        size="mini"
        header={t`Login required`}
        content={t`You need to log in to access this page`}
        actions={[
          {key: 'login', content: t`Login`, positive: true, onClick: login},
          {
            key: 'cancel',
            content: t`Cancel`,
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
