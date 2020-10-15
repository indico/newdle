import React from 'react';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {useRouteMatch} from 'react-router-dom';
import {Trans, t} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Container, Icon, Button, Popup} from 'semantic-ui-react';
import {getStoredParticipantCodeForNewdle} from '../answerSelectors';
import {getUserInfo} from '../selectors';
import styles from './NewdleTitle.module.scss';

export default function NewdleTitle({
  title,
  author,
  creatorUid,
  finished,
  code,
  isPrivate,
  isDeleted,
}) {
  const userInfo = useSelector(getUserInfo);
  const participantCode = useSelector(state => getStoredParticipantCodeForNewdle(state, code));
  const history = useHistory();
  const isSummary = !!useRouteMatch({path: '/newdle/:code/summary'});

  const summaryURL = `/newdle/${code}/summary`;
  const answerURL = `/newdle/${code}/${participantCode || ''}`;

  return (
    <Container text className={styles['box']}>
      <div className={styles['flexbox']}>
        <div>
          <div className={styles['title']}>
            <h1 className={styles['header']}>{title}</h1>
          </div>
          <div className={styles['subtitle']}>
            <Trans>by {author}</Trans>
          </div>
        </div>
        {!isDeleted && (!isPrivate || (userInfo && userInfo.uid === creatorUid)) && (
          <div className={styles['view-options']}>
            <Button.Group>
              <Popup
                content={!finished ? t`Answer newdle` : t`This newdle has already finished`}
                position="bottom center"
                trigger={
                  <Button
                    icon
                    active={!isSummary}
                    onClick={() => (isSummary ? history.push(answerURL) : null)}
                    disabled={finished}
                  >
                    <Icon name="calendar plus outline" />
                  </Button>
                }
              />
              <Popup
                content="View summary"
                position="bottom center"
                trigger={
                  <Button
                    icon
                    active={isSummary}
                    onClick={() => (!isSummary ? history.push(summaryURL) : null)}
                  >
                    <Icon name="tasks" />
                  </Button>
                }
              />
            </Button.Group>
          </div>
        )}
      </div>
    </Container>
  );
}

NewdleTitle.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  creatorUid: PropTypes.string.isRequired,
  label: PropTypes.string,
  finished: PropTypes.bool,
  code: PropTypes.string.isRequired,
  isPrivate: PropTypes.bool,
  isDeleted: PropTypes.bool,
};

NewdleTitle.defaultProps = {
  label: null,
  finished: null,
  isDeleted: false,
  isPrivate: true,
};
