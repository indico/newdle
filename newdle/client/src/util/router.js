import {useContext} from 'react';
import {__RouterContext as RouterContext} from 'react-router-dom';

export function useRouter() {
  return useContext(RouterContext);
}
