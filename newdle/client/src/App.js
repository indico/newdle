import React from 'react';
import {useSelector} from 'react-redux';
import {Modal} from 'semantic-ui-react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Home from './Home';
import CreateNewdle from './CreateNewdle';
import {isRefreshingToken} from './selectors';
import {useAuthentication} from './auth';
import TopHeader from './components/TopHeader';
import './App.module.scss';

export default function App() {
  const refreshing = useSelector(isRefreshingToken);
  const {login, logout} = useAuthentication();

  return (
    <Router>
      <main>
        <TopHeader />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/new" component={CreateNewdle} />
          <Route render={() => 'This page does not exist'} />
        </Switch>
        {refreshing && (
          <Modal
            open
            size="mini"
            header="Your session expired"
            content="Please log in again to confirm your identity"
            actions={[
              {key: 'login', content: 'Login', positive: true, onClick: login},
              {key: 'logout', content: 'Logout', onClick: logout},
            ]}
          />
        )}
      </main>
    </Router>
  );
}
