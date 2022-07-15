import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router';
import {clearNewdle, fetchNewdle} from '../../actions';
import {getNewdle} from '../../selectors';
import NewdleTitle from '../NewdleTitle';

export default function SummaryHeader() {
  const {code} = useParams();
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

  return (
    <NewdleTitle
      title={newdle.title}
      author={newdle.creator_name}
      creatorUid={newdle.creator_uid}
      finished={!!newdle.final_dt}
      code={newdle.code}
      url={newdle.url}
      isPrivate={newdle.private}
      isDeleted={newdle.deleted}
      limitedSlots={newdle.limited_slots}
    />
  );
}
