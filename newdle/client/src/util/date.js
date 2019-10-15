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

export function getHourSpan(input) {
  const {timeSlots, defaultHourSpan, defaultMinHour, defaultMaxHour, duration, format} = input;
  const timeSlotsMoment = timeSlots.map(c => toMoment(c, format));
  let minTimelineHour = moment.min(timeSlotsMoment).hour();
  let maxTimeline = moment
    .max(timeSlotsMoment)
    .clone()
    .add(duration, 'm');
  // if the last date slot overflows the day, use midnight instead
  maxTimeline = moment.min(maxTimeline, maxTimeline.clone().endOf('day'));

  // round up to closest hour
  const maxTimelineHour = maxTimeline.minutes() ? maxTimeline.hour() + 1 : maxTimeline.hour();

  if (maxTimelineHour - minTimelineHour > defaultHourSpan) {
    // expand
    return [minTimelineHour, maxTimelineHour];
  } else if (minTimelineHour < defaultMinHour) {
    // shift
    return [minTimelineHour, minTimelineHour + defaultHourSpan];
  } else {
    return [defaultMinHour, defaultMaxHour];
  }
}
