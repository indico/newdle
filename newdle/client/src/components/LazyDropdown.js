import React, {useState} from 'react';
import {Dropdown} from 'semantic-ui-react';

export default function LazyDropdown(props) {
  const [activated, setActivated] = useState(false);

  if (!activated) {
    const activeOptions = props.options.filter(x => x.value === props.value);
    return <Dropdown {...props} onOpen={() => setActivated(true)} options={activeOptions} />;
  }

  return <Dropdown {...props} />;
}

LazyDropdown.propTypes = Dropdown.propTypes;
