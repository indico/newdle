import {useEffect} from 'react';
import {useMediaQuery} from 'react-responsive';

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

export function useIsSmallScreen() {
  return useMediaQuery({query: '(max-width: 1224px)'});
}

export function useIsMobile() {
  return useMediaQuery({query: '(max-width: 767px)'});
}

export function useNumDaysVisible() {
  return useIsSmallScreen() ? 1 : 3;
}
