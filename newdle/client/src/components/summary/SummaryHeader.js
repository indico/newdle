import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getNewdle} from '../../selectors';
import {clearNewdle, fetchNewdle} from '../../actions';
import NewdleTitle from '../NewdleTitle';

export default function SummaryHeader({match}) {
  const code = match.params.code;
  const newdle = useSelector(getNewdle);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdle(code, true));

    return () => {
      dispatch(clearNewdle());
    };
  }, [code, dispatch]);

  if (!newdle) {
    return null;
  }

  const label = newdle.final_dt ? 'finished' : 'ongoing';
  return (
    <NewdleTitle
      title={newdle.title}
      author={newdle.creator_name}
      label={label}
      finished={!!newdle.final_dt}
    />
  );
}
