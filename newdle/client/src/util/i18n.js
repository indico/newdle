import {i18n} from '@lingui/core';
import {
  en as pluralsEN,
  es as pluralsES,
  de as pluralsDE,
  eo as pluralsEO,
  fr as pluralsFR,
  he as pluralsHE,
  id as pluralsID,
  it as pluralsIT,
  nb as pluralsNO,
  ta as pluralsTA,
} from 'make-plural/plurals';
import {messages as messagesDE} from '../locales/de/messages';
import {messages as messagesEN} from '../locales/en/messages';
import {messages as messagesEO} from '../locales/eo/messages';
import {messages as messagesES} from '../locales/es/messages';
import {messages as messagesFR} from '../locales/fr/messages';
import {messages as messagesHE} from '../locales/he/messages';
import {messages as messagesID} from '../locales/id/messages';
import {messages as messagesIT} from '../locales/it/messages';
import {messages as messagesNO} from '../locales/nb_NO/messages';
import {messages as messagesTA} from '../locales/ta/messages';

i18n.loadLocaleData({
  en: {plurals: pluralsEN},
  es: {plurals: pluralsES},
  de: {plurals: pluralsDE},
  eo: {plurals: pluralsEO},
  fr: {plurals: pluralsFR},
  he: {plurals: pluralsHE},
  id: {plurals: pluralsID},
  it: {plurals: pluralsIT},
  nb: {plurals: pluralsNO},
  ta: {plurals: pluralsTA},
});
i18n.load({
  en: messagesEN,
  es: messagesES,
  de: messagesDE,
  eo: messagesEO,
  fr: messagesFR,
  he: messagesHE,
  id: messagesID,
  it: messagesIT,
  nb: messagesNO,
  ta: messagesTA,
});
i18n.activate(getInitialLanguage());

export function setLocale(locale) {
  localStorage.setItem('userLanguage', locale);
  i18n.activate(locale);
}

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem('userLanguage');
  if (!savedLanguage || !getLanguageOptions()[savedLanguage]) {
    return 'en';
  }
  return savedLanguage || negotiateLocale();
}

function negotiateLocale() {
  const supportedLocales = Object.keys(getLanguageOptions());
  const requestedLocales = navigator.languages || [navigator.language];

  for (const locale of requestedLocales) {
    const segments = locale.split('-');

    while (segments.length > 0) {
      const candidate = segments.join('-');
      if (supportedLocales.includes(candidate)) {
        return candidate;
      }
      segments.pop();
    }
  }
  return 'en';
}

export function getLanguageOptions() {
  return {
    de: 'Deutsch',
    en: 'English',
    eo: 'Esperanto',
    es: 'español',
    fr: 'français',
    he: 'עברית',
    id: 'Bahasa Indonesia',
    it: 'italiano',
    nb: 'norsk',
    ta: 'தமிழ்',
  };
}
