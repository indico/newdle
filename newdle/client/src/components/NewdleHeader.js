import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Header} from 'semantic-ui-react';
import {getNewdle, getUserInfo} from '../selectors';
import {fetchNewdle} from '../actions';
import styles from './NewdleHeader.module.scss';

export default function NewdleHeader({match}) {
  const [code] = useState(match.params.code);
  const newdle = useSelector(getNewdle);
  const user = useSelector(getUserInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdle(code, true));
  }, [code, dispatch]);

  return (
    <Container text className={styles['summary']}>
      {newdle && user && (
        <div className={styles['header']}>
          <Header as="h1">
            <Header.Content className={styles['title']}>
              {newdle.title}
              <Header.Subheader className={styles['subtitle']}>by {user.name}</Header.Subheader>
            </Header.Content>
          </Header>
        </div>
      )}
    </Container>
  );
}
