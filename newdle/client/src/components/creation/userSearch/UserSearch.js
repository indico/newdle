import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {t, Trans} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Button, Icon, Label, List, Modal, Popup, Segment} from 'semantic-ui-react';
import {addParticipants, removeParticipant} from '../../../actions';
import client from '../../../client';
import {getParticipants, getUserInfo} from '../../../selectors';
import UserAvatar from '../../UserAvatar';
import UserSearchForm from './UserSearchForm';
import UserSearchResults from './UserSearchResults';
import styles from './UserSearch.module.scss';

async function searchUsers(data, setResults) {
  const name = (data.name || '').trim();
  const email = (data.email || '').trim();

  if (!name && !email) {
    return;
  }
  const results = await client.catchErrors(client.searchUsers(name, email));

  if (results !== undefined) {
    setResults(results);
  }
}

export default function UserSearch({isCloning}) {
  const dispatch = useDispatch();
  const participants = useSelector(getParticipants);
  const user = useSelector(getUserInfo);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [stagedParticipants, setStagedParticipants] = useState([]);

  const handleRemoveParticipant = participant => dispatch(removeParticipant(participant));

  const handleModalClose = useCallback(() => {
    setUserModalOpen(false);
    setSearchResults(null);
    setStagedParticipants([]);
  }, [setUserModalOpen, setSearchResults, setStagedParticipants]);

  const isPresent = useCallback(
    participant =>
      [...participants, ...stagedParticipants].find(p => p.email === participant.email),
    [participants, stagedParticipants]
  );

  const handleModalConfirm = useCallback(() => {
    dispatch(addParticipants(stagedParticipants));
    handleModalClose();
  }, [dispatch, handleModalClose, stagedParticipants]);

  const addMyself = (
    <Button
      floated="right"
      color="violet"
      size="small"
      disabled={!!isPresent(user)}
      onClick={() => dispatch(addParticipants([{...user, auth_uid: user.uid}]))}
    >
      <Trans>Add myself</Trans>
    </Button>
  );

  const modalTrigger = (
    <Button
      labelPosition="right"
      floated="right"
      onClick={() => setUserModalOpen(true)}
      color="violet"
      size="small"
      icon
    >
      <Trans>Add participant</Trans>
      <Icon name="add" />
    </Button>
  );

  return (
    <div className={styles['user-search-container']}>
      <Segment>
        {participants.length !== 0 ? (
          <List selection relaxed>
            {participants
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(participant => (
                <List.Item
                  // when creating a new newdle, all participants have an email, but when editing
                  // we may also have participants without one - but everyone has an ID there
                  key={participant.email || participant.id}
                  className={styles['participant-list-item']}
                >
                  <List.Icon verticalAlign="middle">
                    <UserAvatar
                      user={participant}
                      size={30}
                      className={styles['participant-avatar']}
                    />
                  </List.Icon>
                  <List.Content verticalAlign="middle">
                    {participant.name}
                    {isCloning && participant.email === null && (
                      <Popup
                        content={t`This user was not logged in and will be skipped in the cloned newdle.`}
                        trigger={
                          <Icon
                            name="warning circle"
                            size="large"
                            color="orange"
                            style={{marginLeft: 7}}
                          />
                        }
                      />
                    )}
                  </List.Content>
                  <List.Icon
                    className={styles['remove-icon']}
                    verticalAlign="middle"
                    floated="right"
                  >
                    <Icon
                      name="remove circle"
                      size="large"
                      onClick={() => handleRemoveParticipant(participant)}
                    />
                  </List.Icon>
                </List.Item>
              ))}
          </List>
        ) : (
          <div>
            <Trans>No participants selected</Trans>
          </div>
        )}
      </Segment>
      <Modal
        trigger={modalTrigger}
        className={styles['user-search-modal']}
        onClose={handleModalClose}
        size="small"
        closeIcon
        open={userModalOpen}
      >
        <Modal.Header className={styles['user-search-modal-header']}>
          <span>
            <Trans>Add new participants</Trans>
          </span>
          {stagedParticipants.length !== 0 && (
            <Label color="green" size="small" circular>
              {stagedParticipants.length}
            </Label>
          )}
        </Modal.Header>
        <Modal.Content>
          <UserSearchForm onSearch={data => searchUsers(data, setSearchResults)} />
          {searchResults && (
            <UserSearchResults
              results={searchResults}
              onAdd={user =>
                // Quick-fix: users are identified by uid, while participants' field is auth_uid
                setStagedParticipants([...stagedParticipants, {...user, auth_uid: user.uid}])
              }
              isAdded={isPresent}
            />
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleModalConfirm} disabled={stagedParticipants.length === 0} positive>
            <Trans>Confirm</Trans>
          </Button>
          <Button onClick={handleModalClose}>
            <Trans>Cancel</Trans>
          </Button>
        </Modal.Actions>
      </Modal>
      {addMyself}
    </div>
  );
}

UserSearch.propTypes = {
  isCloning: PropTypes.bool,
};

UserSearch.defaultProps = {
  isCloning: false,
};
