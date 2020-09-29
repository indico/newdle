import React from 'react';
import {Select} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {setLanguage} from '../../actions';
import {getLanguage} from '../../selectors';

import styles from './LanguageSelector.module.scss';

export default function LanguageSelector() {
  const language = useSelector(getLanguage);
  const dispatch = useDispatch();

  const languageOptions = [
    {key: 'en', value: 'en', text: 'English'},
    {key: 'es', value: 'es', text: 'Spanish'},
  ];

  return (
    <div className={styles.dropdown}>
      <Select
        placeholder="Select your language"
        options={languageOptions}
        onChange={(_, {value}) => dispatch(setLanguage(value))}
        value={language}
      />
    </div>
  );
}
