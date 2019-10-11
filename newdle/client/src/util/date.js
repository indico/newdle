import moment, {HTML5_FMT} from 'moment';

export function toMoment(date, format = null) {
  return date ? moment(date, format) : null;
}

export function serializeDate(date, format = HTML5_FMT.DATE) {
  return moment(date).format(format);
}

export function overlaps([start1, end1], [start2, end2]) {
  return start1.isBefore(end2) && start2.isBefore(end1);
}
