import moment, {HTML5_FMT} from 'moment';

export function toMoment(date, format = null) {
  return date ? moment(date, format) : null;
}

export function serializeDate(date, format = HTML5_FMT.DATE) {
  return moment(date).format(format);
}
