import React from 'react';
import PropTypes from 'prop-types';
import Gravatar from 'react-gravatar';

const DEFAULT_AVATAR_SIZE = 40;
const defaultArgs = [
  'f0e9e9', // background
  '8b5d5d', // color
  2, // length
  0.5, // font size
  true, // rounded
].join('/');

function UserAvatar({user: {email, name, initials}, className, withLabel, size}) {
  initials = initials.replace(/[/?#]/g, '');
  const uri = `https://ui-avatars.com/api/${initials}/${size}/${defaultArgs}`;

  return (
    <div className={className}>
      {withLabel && <span>{name}</span>}{' '}
      <Gravatar email={email} default={encodeURI(uri)} size={size} />
    </div>
  );
}

UserAvatar.propTypes = {
  user: PropTypes.object.isRequired,
  withLabel: PropTypes.bool,
  size: PropTypes.number,
};

UserAvatar.defaultProps = {
  withLabel: false,
  size: DEFAULT_AVATAR_SIZE,
};

export default React.memo(UserAvatar);
