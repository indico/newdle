import React, {useState} from 'react';
import {Dropdown} from 'semantic-ui-react';

export default function LazyDropdown(props) {
  const [activated, setActivated] = useState(false);

  const handleActivate = () => {
    setActivated(true);
  };

  if (!activated) {
    const activeText = props.value ? props.options.find(x => x.value === props.value).text : '';
    return (
      /* eslint-disable jsx-a11y/role-has-required-aria-props */
      <div
        role="combobox"
        aria-expanded="false"
        className={`ui search selection dropdown ${props.className}`}
        onClick={handleActivate}
      >
        <input
          aria-autocomplete="list"
          autoComplete="off"
          className="search"
          tabIndex="0"
          type="text"
          onFocus={handleActivate}
          onClick={handleActivate}
        />
        <div className="text" role="alert" aria-live="polite" aria-atomic="true">
          {activeText}
        </div>
        <i aria-hidden="true" className="dropdown icon" />
      </div>
    );
  }

  return (
    <Dropdown
      {...props}
      defaultOpen
      openOnFocus={false} /* otherwise it stays open after the first click on an option */
    />
  );
}

LazyDropdown.propTypes = Dropdown.propTypes;
