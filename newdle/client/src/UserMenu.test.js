import React from 'react';
import {useSelector} from 'react-redux';
import {mount} from 'enzyme';
import {Icon} from 'semantic-ui-react';
import UserMenu from './UserMenu';

jest.mock('react-gravatar');
jest.mock('react-redux');

describe('<UserMenu />', () => {
  it('renders UserMenu successfully for anonymous users', () => {
    const component = mount(<UserMenu />);
    expect(component.contains(Icon)).toBe(true);
    expect(component.exists('.user-gravatar')).toBe(false);
    component.unmount();
  });

  it('renders UserMenu successfully for users with Gravatar', () => {
    useSelector.mockImplementation(() => ({
      email: 'example@example.com',
      first_name: 'Guinea',
      last_name: 'Pig',
    }));

    const component = mount(<UserMenu />);
    expect(component.exists(Icon)).toBe(false);
    expect(component.exists('.user-gravatar')).toBe(true);
    component.unmount();
  });
});
