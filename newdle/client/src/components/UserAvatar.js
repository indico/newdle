import React from 'react';
import PropTypes from 'prop-types';
import {Popup} from 'semantic-ui-react';

const DEFAULT_AVATAR_SIZE = 42;

function UserAvatar({user: {name, avatar_url}, className, withLabel, size}) {
  const avatarURL = new URL(avatar_url, window.location.origin);
  avatarURL.searchParams.set('size', size);
  return (
    <div className={className}>
      {withLabel && <span>{name}</span>}{' '}
      <Popup
        position="top center"
        mouseEnterDelay={100}
        trigger={<img className="user-avatar" src={avatarURL} alt="" />}
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
