import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {clearNewdle, fetchNewdle} from '../../actions';
import {getNewdle} from '../../selectors';
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

SummaryHeader.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
