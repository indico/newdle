import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router';
import {getUserInfo} from 'src/selectors';
import {abortAnswering, fetchNewdleForAnswer, clearNewdle, fetchNewdle} from '../../actions';
import {getNewdle} from '../../answerSelectors';
import NewdleTitle from '../NewdleTitle';

export default function AnswerHeader() {
  const {code} = useParams();
  const newdle = useSelector(getNewdle);
  const user = useSelector(getUserInfo) || {};
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdleForAnswer(code));

    return () => {
      dispatch(abortAnswering());
    };
  }, [code, dispatch]);

  // Load newdle participants if the newdle is not private or
  // the user is the creator
  useEffect(() => {
    if (newdle && (!newdle.private || user.uid === newdle.creator_uid)) {
      dispatch(fetchNewdle(code, true));
    }

    return () => {
      dispatch(clearNewdle());
    };
  }, [code, dispatch, newdle, user.uid]);

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
