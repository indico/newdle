import es from '../locales/es/messages.js';
import en from '../locales/en/messages.js';

export function getInitialLanguage() {
  return localStorage.getItem('userLanguage') || navigator.language.substring(0, 2);
}

export function getTranslationCatalogs() {
  return {en, es};
}

export function getLanguageOptions() {
  return {en: 'English', es: 'Spanish'};
}
