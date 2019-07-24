export const getToken = state => state.auth.token;
export const isLoggedIn = state => !!state.auth.token;
export const isRefreshingToken = state => !!state.auth.refreshing;
export const getUserInfo = state => state.user;
