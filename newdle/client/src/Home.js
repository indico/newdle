import React from 'react';
import {useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {isLoggedIn} from './selectors';

export default function Home() {
  const isUserLoggedIn = useSelector(isLoggedIn);

  return (
    <>
      <h2>Home</h2>
      {isUserLoggedIn && <Link to="/new">Create newdle</Link>}
    </>
  );
}
