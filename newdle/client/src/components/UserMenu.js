import React from 'react';
import {useSelector} from 'react-redux';
import {Dropdown, Icon} from 'semantic-ui-react';
import {useAuthentication} from '../auth';
import {isLoggedIn, getUserInfo} from '../selectors';
import UserAvatar from './UserAvatar';

import styles from './UserMenu.module.scss';

export default function UserMenu() {
  const user = useSelector(getUserInfo);
  const {login, logout} = useAuthentication();
  const isUserLoggedIn = useSelector(isLoggedIn);
  const iconComponent = user ? (
    <UserAvatar user={user} className={styles['user-gravatar']} withLabel />
  ) : (
    <Icon bordered inverted color="grey" name="user" size="large" circular />
  );

  return isUserLoggedIn ? (
    <Dropdown
      disabled={!user}
      icon={null}
      trigger={iconComponent}
      className={styles['user-menu']}
      pointing="top right"
      item
    >
      <Dropdown.Menu>
        {isUserLoggedIn && <Dropdown.Item onClick={logout}>Log out</Dropdown.Item>}
      </Dropdown.Menu>
    </Dropdown>
  ) : (
    <div className={styles['anonymous-user']} onClick={login}>
      <span>Log in</span>
      <Icon bordered inverted color="grey" name="key" size="large" circular />
    </div>
  );
}
