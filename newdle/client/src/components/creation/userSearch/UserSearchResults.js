import React from 'react';
import PropTypes from 'prop-types';
import {Divider, Icon, List} from 'semantic-ui-react';
import {Trans} from '@lingui/macro';

import styles from './UserSearchResults.module.scss';

export default function UserSearchResults({results: {users, total}, onAdd, isAdded}) {
  return total !== 0 ? (
    <>
      <Divider horizontal>{`${total} users`}</Divider>
      <List divided relaxed selection>
        {users.map(user => (
          <List.Item key={user.email} className={styles['result-item']}>
            <List.Content floated="right">
              {isAdded(user) ? (
                <Icon name="checkmark" color="green" size="large" />
              ) : (
                <Icon name="plus" size="large" onClick={() => onAdd(user)} />
              )}
            </List.Content>
            <List.Icon size="large" name="user" verticalAlign="middle" />
            <List.Content>
              {user.name} ({user.email})
            </List.Content>
          </List.Item>
        ))}
      </List>
    </>
  ) : (
    <Divider horizontal>
      <Trans>No users matching the criteria</Trans>
    </Divider>
  );
}

UserSearchResults.propTypes = {
  results: PropTypes.shape({
    total: PropTypes.number.isRequired,
    users: PropTypes.array.isRequired,
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
  isAdded: PropTypes.func.isRequired,
};
