import React from 'react';
import {useSelector} from 'react-redux';
import {Dropdown, Icon} from 'semantic-ui-react';
import Gravatar from 'react-gravatar';
import {useAuthentication} from './auth';
import {isLoggedIn, getUserInfo} from './selectors';

import styles from './UserMenu.module.scss';

const defaultArgs = [
  40, // size
  'f0e9e9', // background
  '8b5d5d', // color
  2, // length
  0.5, // font size
  true, // rounded
].join('/');

function renderGravatar({email, first_name: firstName, last_name: lastName}) {
  const uri = `https://ui-avatars.com/api/${firstName[0]} ${lastName[0]}/${defaultArgs}`;

  return (
    <div className={styles['user-gravatar']}>
      <span>{`${firstName} ${lastName}`}</span>{' '}
      <Gravatar email={email} default={encodeURI(uri)} size={40} />
    </div>
  );
}

export default function UserMenu() {
  const user = useSelector(getUserInfo);
  const {login, logout} = useAuthentication();
  const isUserLoggedIn = useSelector(isLoggedIn);
  const iconComponent = user ? (
    renderGravatar(user)
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
