import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Label} from 'semantic-ui-react';
import {getNewdleTitle, getUserInfo, getNewdleFinalDt} from '../../selectors';
import {fetchNewdle} from '../../actions';
import styles from './summary.module.scss';

export default function SummaryHeader({match}) {
  const code = match.params.code;
  const title = useSelector(getNewdleTitle);
  const user = useSelector(getUserInfo);
  const finalDt = useSelector(getNewdleFinalDt);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdle(code, true));
  }, [code, dispatch]);

  return (
    <Container text className={styles.summary}>
      {title && user && (
        <>
          <div className={styles.title}>
            <h1 className={styles.header}>{title} </h1>
            <Label color={finalDt ? 'blue' : 'green'} size="tiny" className={styles.label}>
              {finalDt ? 'finished' : 'ongoing'}
            </Label>
          </div>
          <div className={styles.subtitle}>by {user.name}</div>
        </>
      )}
    </Container>
  );
}
