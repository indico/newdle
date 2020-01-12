import React from 'react';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {Dropdown, Icon} from 'semantic-ui-react';
import {useAuthentication} from '../auth';
import {isLoggedIn, getUserInfo} from '../selectors';
import UserAvatar from './UserAvatar';

import styles from './UserMenu.module.scss';

export default function UserMenu() {
  const history = useHistory();
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
        <Dropdown.Item
          href="/mine"
          onClick={evt => {
            evt.preventDefault();
            history.push('/mine');
          }}
        >
          My newdles
        </Dropdown.Item>
        <Dropdown.Item
          href="/participating"
          onClick={evt => {
            evt.preventDefault();
            history.push('/participating');
          }}
        >
          Newdles I'm In
        </Dropdown.Item>
        <Dropdown.Item onClick={logout}>Log out</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  ) : (
    <div className={styles['unknown-user']} onClick={login}>
      <span>Log in</span>
      <Icon bordered inverted color="grey" name="key" size="large" circular />
    </div>
  );
}
