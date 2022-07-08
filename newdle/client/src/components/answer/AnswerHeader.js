import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {getUserInfo} from 'src/selectors';
import {
  abortAnswering,
  fetchNewdleForAnswer,
  clearNewdle,
  fetchNewdle,
  abortCreation,
} from '../../actions';
import {getNewdle} from '../../answerSelectors';
import NewdleTitle from '../NewdleTitle';

export default function AnswerHeader({match}) {
  const code = match.params.code;
  const newdle = useSelector(getNewdle);
  const user = useSelector(getUserInfo) || {};
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNewdleForAnswer(code));

    return () => {
      dispatch(abortAnswering());
      dispatch(abortCreation());
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
