import React from 'react';
import {useSelector} from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {HomePage} from './home';
import {CreationPage, CreationSuccessPage} from './creation';
import {isLoginWindowOpen, getError} from '../selectors';
import {AnswerPage} from './answer';
import {SummaryPage} from './summary';
import TopHeader from './TopHeader';
import LoginPrompt from './login/LoginPrompt';
import LoggingIn from './login/LoggingIn';
import MyNewdles from './MyNewdles';
import ErrorMessage from './ErrorMessage';

import './App.module.scss';

export default function App() {
  const loggingIn = useSelector(isLoginWindowOpen);
  const error = useSelector(getError);

  return (
    <Router>
      <main>
        <TopHeader />
        {!error ? (
          <>
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/new" component={CreationPage} />
              <Route exact path="/new/success" component={CreationSuccessPage} />
              <Route exact path="/mine" component={MyNewdles} />
              <Route path="/newdle/:code/summary" component={SummaryPage} />
              <Route exact path="/newdle/:code/:partcode?" component={AnswerPage} />
              <Route render={() => <ErrorMessage error={'This page does not exist'} />} />
            </Switch>
            <LoginPrompt />
            {loggingIn && <LoggingIn />}
          </>
        ) : (
          <ErrorMessage error={error} />
        )}
      </main>
    </Router>
  );
}
