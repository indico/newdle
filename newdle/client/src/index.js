import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import 'indico-sui-theme/semantic.css';
import App from './App';
import store from './store';
import client from './client';
import * as serviceWorker from './serviceWorker';
import {checkInitialToken, subscribeTokenChanges} from './auth';

client.store = store;
checkInitialToken(store);
subscribeTokenChanges(store);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
