import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Container, Icon, Label, List, Modal, Segment} from 'semantic-ui-react';
import UserSearchForm from './UserSearchForm';
import UserSearchResults from './UserSearchResults';
import UserAvatar from '../../UserAvatar';
import {addParticipants, removeParticipant} from '../../../actions';
import {getMeetingParticipants} from '../../../selectors';
import client from '../../../client';

import styles from './UserSearch.module.scss';

async function searchUsers(data, setResults) {
  const q = Object.keys(data)
    .filter(k => data[k])
    .map(k => data[k])
    .join(' ');

  if (!q.trim()) {
    return;
  }
  const results = await client.searchUsers(q);
  setResults(results);
}

export default function UserSearch() {
  const dispatch = useDispatch();
  const participants = useSelector(getMeetingParticipants);
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

  const modalTrigger = (
    <Button
      labelPosition="right"
      floated="right"
      onClick={() => setUserModalOpen(true)}
      color="violet"
      size="small"
      icon
    >
      Add participant
      <Icon name="add" />
    </Button>
  );

  return (
    <>
      <Container className={styles['user-search-container']}>
        <Segment>
          {participants.length !== 0 ? (
            <List selection relaxed>
              {participants.map(participant => (
                <List.Item key={participant.email} className={styles['participant-list-item']}>
                  <List.Content className={styles['remove-icon']} verticalAlign="middle">
                    <Icon
                      name="remove circle"
                      size="large"
                      onClick={() => handleRemoveParticipant(participant)}
                    />
                  </List.Content>
                  <List.Icon verticalAlign="middle">
                    <UserAvatar
                      user={participant}
                      size={35}
                      className={styles['participant-avatar']}
                    />
                  </List.Icon>
                  <List.Content verticalAlign="middle">{participant.name}</List.Content>
                </List.Item>
              ))}
            </List>
          ) : (
            <div>No participants selected</div>
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
            <span>Add new participants</span>
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
                onAdd={user => setStagedParticipants([...stagedParticipants, user])}
                isAdded={isPresent}
              />
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={handleModalConfirm}
              disabled={stagedParticipants.length === 0}
              positive
            >
              Confirm
            </Button>
            <Button onClick={handleModalClose}>Cancel</Button>
          </Modal.Actions>
        </Modal>
      </Container>
    </>
  );
}
