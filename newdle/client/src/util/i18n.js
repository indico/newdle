export function getInitialLanguage() {
  return localStorage.getItem('userLanguage') || navigator.language.substring(0, 2);
}
