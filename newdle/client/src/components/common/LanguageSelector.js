import React from 'react';
import {Select} from 'semantic-ui-react';
import {useDispatch, useSelector} from 'react-redux';
import {setLanguage} from '../../actions';
import {getLanguage} from '../../selectors';
import {getLanguageOptions} from '../../util/i18n';

import styles from './LanguageSelector.module.scss';

export default function LanguageSelector() {
  const language = useSelector(getLanguage);
  const dispatch = useDispatch();

  if (window.location.hash !== '#i18n') {
    // hide locale selector for now since we don't have any complete translations
    return null;
  }

  const languageOptions = Object.entries(getLanguageOptions()).map(([code, title]) => ({
    key: code,
    value: code,
    text: title,
  }));

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
