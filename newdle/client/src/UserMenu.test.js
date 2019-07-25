import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {Icon} from 'semantic-ui-react';
import configureMockStore from '@jedmao/redux-mock-store';
import UserMenu from './UserMenu';

const mockStore = configureMockStore();
const mockAnonStore = () => mockStore({user: null, auth: {token: null}});
const mockUserStore = () =>
  mockStore({
    user: {
      email: 'example@example.com',
      name: 'Guinea Pig',
      initials: 'G P',
    },
    auth: {token: 'something'},
  });

describe('<UserMenu />', () => {
  it('renders an icon for anonymous users', () => {
    const store = mockAnonStore();
    const component = mount(
      <Provider store={store}>
        <UserMenu />
      </Provider>
    );
    expect(component.contains(Icon)).toBe(true);
    expect(component.exists('.user-gravatar')).toBe(false);
    component.unmount();
  });

  it('renders a gravatar for logged-in users', () => {
    const store = mockUserStore();
    const component = mount(
      <Provider store={store}>
        <UserMenu />
      </Provider>
    );
    expect(component.exists(Icon)).toBe(false);
    expect(component.exists('.user-gravatar')).toBe(true);
    component.unmount();
  });
});
