import React from 'react';
import LoginLink from './LoginLink';

export default function Home() {
  return (
    <>
      <h2>Home</h2>
      <LoginLink to="/new">Create newdle</LoginLink>
    </>
  );
}
