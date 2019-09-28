import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Header} from 'semantic-ui-react';
import {getNewdleTitle, getUserInfo} from '../selectors';
import {fetchNewdle} from '../actions';
import styles from './NewdleHeader.module.scss';

export default function NewdleHeader({match}) {
  const [code] = useState(match.params.code);
  const title = useSelector(getNewdleTitle);
  const user = useSelector(getUserInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdle(code, true));
  }, [code, dispatch]);

  return (
    <Container text className={styles['summary']}>
      {title && user && (
        <div className={styles['header']}>
          <Header as="h1">
            <Header.Content className={styles['title']}>
              {title}
              <Header.Subheader className={styles['subtitle']}>by {user.name}</Header.Subheader>
            </Header.Content>
          </Header>
        </div>
      )}
    </Container>
  );
}
