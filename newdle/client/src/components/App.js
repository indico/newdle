import React from 'react';
import {useSelector} from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {I18nProvider} from '@lingui/react';
import {HomePage} from './home';
import {CreationPage, CreationSuccessPage} from './creation';
import {isLoginWindowOpen, getErrors} from '../selectors';
import {AnswerPage} from './answer';
import {SummaryPage} from './summary';
import TopHeader from './TopHeader';
import LoginPrompt from './login/LoginPrompt';
import LoggingIn from './login/LoggingIn';
import MyNewdles from './MyNewdles';
import NewdlesParticipating from './NewdlesParticipating';
import ErrorMessage from './ErrorMessage';
import LanguageSelector from './common/LanguageSelector';
import {getLanguage} from '../selectors';
import catalogEs from '../locales/es/messages.js';
import catalogEn from '../locales/en/messages.js';

import './App.module.scss';

export default function App() {
  const loggingIn = useSelector(isLoginWindowOpen);
  const errors = useSelector(getErrors);
  const catalogs = {es: catalogEs, en: catalogEn};
  const lang = useSelector(getLanguage);

  return (
    <I18nProvider language={lang} catalogs={catalogs}>
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
            <Route exact path="/participating" component={NewdlesParticipating} />
            <Route path="/newdle/:code/summary" component={SummaryPage} />
            <Route exact path="/newdle/:code/:partcode?" component={AnswerPage} />
            <Route render={() => <div>This page does not exist</div>} />
          </Switch>
          <Route exact path="/" component={LanguageSelector} />
          <LoginPrompt />
          {loggingIn && <LoggingIn />}
        </main>
      </Router>
    </I18nProvider>
  );
}
