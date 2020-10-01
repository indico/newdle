import React from 'react';
import {Trans} from '@lingui/macro';
import {Dimmer, Loader} from 'semantic-ui-react';

export default function LoggingIn() {
  return (
    <Dimmer active page>
      <Loader size="massive">
        <Trans>Logging in...</Trans>
      </Loader>
    </Dimmer>
  );
}
