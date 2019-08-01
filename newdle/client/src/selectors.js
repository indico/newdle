import moment from 'moment';

export const getToken = state => state.auth.token;
export const isLoggedIn = state => !!state.auth.token;
export const isRefreshingToken = state => !!state.auth.refreshing;
export const getUserInfo = state => state.user;
export const getCalendarDates = state =>
  [...Array(5).keys()].map((_, index) => {
    return moment()
      .add(index, 'day')
      .format(moment.HTML5_FMT.DATE);
  });
export const getCalendarActiveDate = state => state.calendar.activeDate;
export const getStep = state => state.step;
