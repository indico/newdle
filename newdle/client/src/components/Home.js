import React from 'react';
import {Button} from 'semantic-ui-react';
import LoginRequired from './LoginRequired';
import {useRouter} from '../util/router';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <h2>Home</h2>
      <LoginRequired
        component={Button}
        onClick={() => {
          router.history.push('/new');
        }}
      >
        Create newdle
      </LoginRequired>
    </>
  );
}
