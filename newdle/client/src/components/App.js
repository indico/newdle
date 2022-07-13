import React from 'react';
import {useSelector} from 'react-redux';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
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
            <Routes>
              <Route exact path="/" element={<HomePage />} />
              <Route exact path="/new" element={<CreationPage />} />
              <Route exact path="/new/success" element={<CreationSuccessPage />} />
              <Route exact path="/mine" element={<MyNewdles />} />
              <Route exact path="/participating" element={<NewdlesParticipating />} />
              <Route exact path="/newdle/:code/summary" element={<SummaryPage />} />
              <Route path="/newdle/:code/edit/*" element={<EditPage />} />
              <Route path="/newdle/:code/clone" element={<ClonePage />} />
              <Route exact path="/newdle/:code" element={<AnswerPage />} />
              <Route exact path="/newdle/:code/:partcode" element={<AnswerPage />} />
              <Route path="*" element={<div>This page does not exist</div>} />
            </Routes>
          </section>
          <LoginPrompt />
          {loggingIn && <LoggingIn />}
          <Footer />
        </main>
      </Router>
    </I18nProvider>
  );
}
