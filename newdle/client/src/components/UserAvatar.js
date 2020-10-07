import React from 'react';
import Gravatar from 'react-gravatar';
import PropTypes from 'prop-types';
import {Popup} from 'semantic-ui-react';

const DEFAULT_AVATAR_SIZE = 42;
const defaultArgs = [
  'f0e9e9', // background
  '8b5d5d', // color
  2, // length
  0.5, // font size
  true, // rounded
].join('/');

function UserAvatar({user: {email, name}, className, withLabel, size}) {
  const uri = `https://ui-avatars.com/api/${name[0]}/${size}/${defaultArgs}`;

  return (
    <div className={className}>
      {withLabel && <span>{name}</span>}{' '}
      <Popup
        position="top center"
        mouseEnterDelay={100}
        trigger={<Gravatar email={email} default={encodeURI(uri)} size={size} />}
        content={name}
        disabled={withLabel}
      />
    </div>
  );
}

UserAvatar.propTypes = {
  user: PropTypes.object.isRequired,
  className: PropTypes.string,
  withLabel: PropTypes.bool,
  size: PropTypes.number,
};

UserAvatar.defaultProps = {
  className: null,
  withLabel: false,
  size: DEFAULT_AVATAR_SIZE,
};

export default React.memo(UserAvatar);
