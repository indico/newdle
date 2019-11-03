import {useEffect} from 'react';

export function usePageTitle(title, addSuffix = false) {
  useEffect(() => {
    if (!title) {
      return;
    }

    const oldTitle = document.title;
    document.title = addSuffix ? `${title} · newdle` : title;

    return () => {
      document.title = oldTitle;
    };
  });
}
