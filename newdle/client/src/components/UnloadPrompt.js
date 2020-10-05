import React, {useEffect} from 'react';
import {Prompt} from 'react-router';
import {t} from '@lingui/macro';
import PropTypes from 'prop-types';

function UnloadPrompt({active, router, message}) {
  if (!message) {
    message = t`Are you sure you want to leave this page without saving?`;
  }

  useEffect(() => {
    if (!active) {
      return;
    }

    const onBeforeUnload = evt => {
      evt.preventDefault();
      evt.returnValue = message;
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [active, message]);

  return router ? <Prompt when={active} message={message} /> : null;
}

UnloadPrompt.propTypes = {
  active: PropTypes.bool.isRequired,
  router: PropTypes.bool,
  message: PropTypes.string,
};

UnloadPrompt.defaultProps = {
  message: null,
  router: true,
};

export default React.memo(UnloadPrompt);
