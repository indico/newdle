import React from 'react';
import {useSelector} from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {i18n} from '@lingui/core';
import {I18nProvider} from '@lingui/react';
import {isLoginWindowOpen, getErrors} from '../selectors';
import {AnswerPage} from './answer';
import {CreationPage, CreationSuccessPage, EditPage, ClonePage} from './creation';
import ErrorMessage from './ErrorMessage';
import Footer from './Footer';
import {HomePage} from './home';
import LoggingIn from './login/LoggingIn';
import LoginPrompt from './login/LoginPrompt';
import MyNewdles from './MyNewdles';
import NewdlesParticipating from './NewdlesParticipating';
import {SummaryPage} from './summary';
import TopHeader from './TopHeader';

import './App.module.scss';

export default function App() {
  const loggingIn = useSelector(isLoginWindowOpen);
  const errors = useSelector(getErrors);

  return (
    <I18nProvider i18n={i18n}>
      <Router>
        <main>
          <TopHeader />
          {errors.map(error => (
            <ErrorMessage key={error.id} id={error.id} error={error.error} />
          ))}
          <section>
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/new" component={CreationPage} />
              <Route exact path="/new/success" component={CreationSuccessPage} />
              <Route exact path="/mine" component={MyNewdles} />
              <Route exact path="/participating" component={NewdlesParticipating} />
              <Route exact path="/newdle/:code/summary" component={SummaryPage} />
              <Route path="/newdle/:code/edit" component={EditPage} />
              <Route path="/newdle/:code/clone" component={ClonePage} />
              <Route exact path="/newdle/:code/:partcode?" component={AnswerPage} />
              <Route render={() => <div>This page does not exist</div>} />
            </Switch>
          </section>
          <LoginPrompt />
          {loggingIn && <LoggingIn />}
          <Footer />
        </main>
      </Router>
    </I18nProvider>
  );
}
