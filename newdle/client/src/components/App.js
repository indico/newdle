import React from 'react';
import {useSelector} from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {HomePage} from './home';
import {CreationPage, CreationSuccessPage} from './creation';
import {isLoginWindowOpen} from '../selectors';
import {AnswerPage} from './answer';
import TopHeader from './TopHeader';
import LoginPrompt from './login/LoginPrompt';
import LoggingIn from './login/LoggingIn';
import MyNewdles from './MyNewdles';
import './App.module.scss';

export default function App() {
  const loggingIn = useSelector(isLoginWindowOpen);

  return (
    <Router>
      <main>
        <TopHeader />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/new" component={CreationPage} />
          <Route exact path="/new/success" component={CreationSuccessPage} />
          <Route exact path="/mine" component={MyNewdles} />
          <Route exact path="/answer" component={AnswerPage} />
          <Route render={() => 'This page does not exist'} />
        </Switch>
        <LoginPrompt />
        {loggingIn && <LoggingIn />}
      </main>
    </Router>
  );
}
