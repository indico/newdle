import React from 'react';
import {useSelector} from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {HomePage} from './home';
import {CreationPage, CreationSuccessPage} from './creation';
import {isLoginWindowOpen, getErrors} from '../selectors';
import {AnswerPage} from './answer';
import {SummaryPage} from './summary';
import TopHeader from './TopHeader';
import LoginPrompt from './login/LoginPrompt';
import LoggingIn from './login/LoggingIn';
import MyNewdles from './MyNewdles';
import NewdlesImIn from './NewdlesImIn';
import ErrorMessage from './ErrorMessage';

import './App.module.scss';

export default function App() {
  const loggingIn = useSelector(isLoginWindowOpen);
  const errors = useSelector(getErrors);

  return (
    <Router>
      <main>
        <TopHeader />
        {errors.map(error => (
          <ErrorMessage key={error.id} id={error.id} error={error.error} />
        ))}
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/new" component={CreationPage} />
          <Route exact path="/new/success" component={CreationSuccessPage} />
          <Route exact path="/mine" component={MyNewdles} />
          <Route exact path="/in" component={NewdlesImIn} />
          <Route path="/newdle/:code/summary" component={SummaryPage} />
          <Route exact path="/newdle/:code/:partcode?" component={AnswerPage} />
          <Route render={() => <div>This page does not exist</div>} />
        </Switch>
        <LoginPrompt />
        {loggingIn && <LoggingIn />}
      </main>
    </Router>
  );
}
