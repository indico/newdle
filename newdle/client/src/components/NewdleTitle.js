import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {useRouteMatch} from 'react-router-dom';
import {Container, Icon, Button, Popup} from 'semantic-ui-react';
import {getUserInfo} from '../selectors';
import styles from './NewdleTitle.module.scss';

export default function NewdleTitle({title, author, creatorUid, finished, code, isPrivate}) {
  const userInfo = useSelector(getUserInfo);
  const history = useHistory();
  const isSummary = !!useRouteMatch({path: '/newdle/:code/summary'});

  return (
    <Container text className={styles['box']}>
      <div className={styles['flexbox']}>
        <div>
          <div className={styles['title']}>
            <h1 className={styles['header']}>{title}</h1>
          </div>
          <div className={styles['subtitle']}>by {author}</div>
        </div>
        {(!isPrivate || (userInfo && userInfo.uid === creatorUid)) && (
          <div className={styles['view-options']}>
            <Button.Group>
              <Popup
                content={!finished ? 'Answer newdle' : 'This newdle has already finished'}
                position="bottom center"
                trigger={
                  <Button
                    icon
                    active={!isSummary}
                    onClick={() => (isSummary ? history.push(`/newdle/${code}/`) : null)}
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
                    onClick={() => (!isSummary ? history.push(`/newdle/${code}/summary`) : null)}
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
  isPrivate: PropTypes.bool.isRequired,
};

NewdleTitle.defaultProps = {
  label: null,
  finished: null,
};
