import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getNewdleTitle, getUserInfo, getNewdleFinalDt} from '../../selectors';
import {clearNewdle, fetchNewdle} from '../../actions';
import NewdleTitle from '../NewdleTitle';

export default function SummaryHeader({match}) {
  const code = match.params.code;
  const title = useSelector(getNewdleTitle);
  const user = useSelector(getUserInfo);
  const finalDt = useSelector(getNewdleFinalDt);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdle(code, true));

    return () => {
      dispatch(clearNewdle());
    };
  }, [code, dispatch]);

  if (!title || !user) {
    return null;
  }

  const label = finalDt ? 'finished' : 'ongoing';
  return <NewdleTitle title={title} author={user.name} label={label} finished={!!finalDt} />;
}
