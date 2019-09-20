import React from 'react';
import {Dimmer, Loader} from 'semantic-ui-react';

export default function LoggingIn() {
  return (
    <Dimmer active page>
      <Loader size="massive">Logging in...</Loader>
    </Dimmer>
  );
}
