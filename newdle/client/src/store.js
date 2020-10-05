import {applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import root from './reducers';

const store = createStore(root, composeWithDevTools(applyMiddleware(thunkMiddleware)));

export default store;
