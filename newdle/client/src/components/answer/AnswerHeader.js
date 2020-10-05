import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
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

  return (
    <NewdleTitle
      title={newdle.title}
      author={newdle.creator_name}
      creatorUid={newdle.creator_uid}
      finished={!!newdle.final_dt}
      code={newdle.code}
      isPrivate={newdle.private}
      isDeleted={newdle.deleted}
    />
  );
}

AnswerHeader.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
