import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {abortAnswering, fetchNewdleForAnswer} from '../../actions';
import {getNewdle} from '../../answerSelectors';
import NewdleTitle from '../NewdleTitle';

export default function AnswerHeader({match}) {
  const code = match.params.code;
  const newdle = useSelector(getNewdle);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdleForAnswer(code));

    return () => {
      dispatch(abortAnswering());
    };
  }, [code, dispatch]);

  if (!newdle) {
    return null;
  }

  return <NewdleTitle title={newdle.title} author={newdle.creator_name} />;
}
