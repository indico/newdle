import React from 'react';
import PropTypes from 'prop-types';
import {Divider, Icon, List} from 'semantic-ui-react';

export default function UserSearchResults({results: {users, total}, onAdd, isAdded}) {
  return total !== 0 ? (
    <>
      <Divider horizontal>{`${total} users`}</Divider>
      <List divided relaxed selection>
        {users.map(user => (
          <List.Item key={user.email}>
            <List.Content floated="right">
              {isAdded(user) ? (
                <Icon name="checkmark" color="green" />
              ) : (
                <Icon name="plus" onClick={() => onAdd(user)} />
              )}
            </List.Content>
            <List.Icon size="large" name="user" verticalAlign="middle" />
            <List.Content>{user.name}</List.Content>
          </List.Item>
        ))}
      </List>
    </>
  ) : (
    <Divider horizontal>No users matching the criteria</Divider>
  );
}

UserSearchResults.propTypes = {
  results: PropTypes.shape({
    total: PropTypes.number.isRequired,
    users: PropTypes.array.isRequired,
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
};
