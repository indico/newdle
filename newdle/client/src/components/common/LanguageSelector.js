import React from 'react';
import {useLingui} from '@lingui/react';
import {Select} from 'semantic-ui-react';
import {t} from '@lingui/macro';
import {getLanguageOptions, setLocale} from '../../util/i18n';

import styles from './LanguageSelector.module.scss';

export default function LanguageSelector() {
  const {
    i18n: {locale},
  } = useLingui();

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
        placeholder={t`Select your language`}
        options={languageOptions}
        onChange={(_, {value}) => setLocale(value)}
        value={locale}
      />
    </div>
  );
}
