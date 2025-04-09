import React from 'react';
import {useLingui} from '@lingui/react';
import {Select} from 'semantic-ui-react';
import {getLanguageOptions, setLocale} from '../../util/i18n';

export default function LanguageSelector() {
  const {
    i18n: {locale},
  } = useLingui();

  const languageOptions = Object.entries(getLanguageOptions()).map(([code, title]) => ({
    key: code,
    value: code,
    text: title,
  }));

  return (
    <Select options={languageOptions} onChange={(_, {value}) => setLocale(value)} value={locale} />
  );
}
