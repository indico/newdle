import React from 'react';
import PropTypes from 'prop-types';
import {Button as SemanticButton} from 'semantic-ui-react';

export default function Button({disabled, loading, ...rest}) {
  return <SemanticButton disabled={disabled || loading} loading={loading} {...rest} />;
}

Button.propTypes = {
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};
