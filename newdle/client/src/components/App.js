import React from 'react';
import {useSelector} from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Home from './Home';
import CreateNewdle from './CreateNewdle';
import {isLoginWindowOpen} from '../selectors';
import TopHeader from './TopHeader';
import NewdleCreated from './NewdleCreated';
import LoginPrompt from './LoginPrompt';
import LoggingIn from './LoggingIn';
import MyNewdles from './MyNewdles';
import './App.module.scss';

export default function App() {
  const loggingIn = useSelector(isLoginWindowOpen);

  return (
    <Router>
      <main>
        <TopHeader />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/new" component={CreateNewdle} />
          <Route exact path="/new/success" component={NewdleCreated} />
          <Route exact path="/mine" component={MyNewdles} />
          <Route render={() => 'This page does not exist'} />
        </Switch>
        <LoginPrompt />
        {loggingIn && <LoggingIn />}
      </main>
    </Router>
  );
}
