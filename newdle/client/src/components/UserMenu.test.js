import React from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';
import {configureMockStore} from '@jedmao/redux-mock-store';
import {i18n} from '@lingui/core';
import {I18nProvider} from '@lingui/react';
import {mount} from 'enzyme';
import {Icon} from 'semantic-ui-react';
import UserMenu from './UserMenu';

const mockStore = configureMockStore();
const mockAnonStore = () => mockStore({user: null, auth: {token: null}});
const mockUserStore = () =>
  mockStore({
    user: {
      email: 'example@example.com',
      name: 'Guinea Pig',
    },
    auth: {token: 'something'},
  });

describe('<UserMenu />', () => {
  it('renders an icon for anonymous users', () => {
    const store = mockAnonStore();
    const component = mount(
      <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
        <Router>
          <Provider store={store}>
            <UserMenu />
          </Provider>
        </Router>
      </I18nProvider>
    );
    expect(component.contains(Icon)).toBe(true);
    expect(component.exists('.user-gravatar')).toBe(false);
    component.unmount();
  });

  it('renders a gravatar for logged-in users', () => {
    const store = mockUserStore();
    const component = mount(
      <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
        <Router>
          <Provider store={store}>
            <UserMenu />
          </Provider>
        </Router>
      </I18nProvider>
    );
    expect(component.exists(Icon)).toBe(false);
    expect(component.exists('.user-gravatar')).toBe(true);
    component.unmount();
  });
});
