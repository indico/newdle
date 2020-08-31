import moment, {HTML5_FMT} from 'moment';

export const DEFAULT_TIME_FORMAT = 'HH:mm';

export function toMoment(date, format = null, timezone = null) {
  return date ? moment.tz(date, format, timezone) : null;
}

export function serializeDate(date, format = HTML5_FMT.DATE, timezone = null) {
  return moment.tz(date, timezone).format(format);
}

export function overlaps([start1, end1], [start2, end2]) {
  return start1.isBefore(end2) && start2.isBefore(end1);
}

export function getHourSpan(input) {
  const {
    timeSlots,
    busyTimes,
    defaultHourSpan,
    defaultMinHour,
    defaultMaxHour,
    duration,
    format,
    newdleTz,
    userTz,
  } = input;
  let timeSlotsMoment = [];
  if (userTz && newdleTz) {
    timeSlotsMoment = timeSlots.map(c => toMoment(c, format, newdleTz).tz(userTz));
    Object.values(busyTimes).forEach(times =>
      times.forEach(spans =>
        spans.forEach(c => timeSlotsMoment.push(toMoment(c, 'HH:mm', newdleTz).tz(userTz)))
      )
    );
  } else {
    timeSlotsMoment = timeSlots.map(c => toMoment(c, format));
  }
  const minTimelineHour = Math.min(...timeSlotsMoment.map(timeSlot => timeSlot.hour()));

  let maxTimeQuery = null;
  if (userTz && newdleTz) {
    maxTimeQuery = moment.max(
      timeSlotsMoment.map(timeSlot =>
        moment.tz({hour: timeSlot.hour(), minutes: timeSlot.minutes()}, newdleTz).tz(userTz)
      )
    );
  } else {
    maxTimeQuery = moment.max(
      timeSlotsMoment.map(timeSlot => moment({hour: timeSlot.hour(), minutes: timeSlot.minutes()}))
    );
  }
  const maxTimeline = maxTimeQuery.clone().add(duration, 'm');

  const spansOverTwoDays =
    timeSlotsMoment.find(
      timeSlot => !timeSlot.isSame(timeSlot.clone().add(duration, 'm'), 'day')
    ) !== undefined;
  let maxTimelineHour;
  if (spansOverTwoDays) {
    maxTimelineHour = 24 + maxTimeline.hour();
  } else {
    maxTimelineHour = maxTimeline.minutes() ? maxTimeline.hour() + 1 : maxTimeline.hour();
  }

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

export function hourRange(start, end, step = 1, extendToNextDay = true) {
  if (end < start) {
    throw Error('Invalid arguments: end cannot be before start');
  }

  const hours = [start];
  let it = start;

  while (it < end) {
    it += step;

    if (it > 24) {
      if (extendToNextDay) {
        hours.push(it - 24);
      }
      break;
    }

    hours.push(it);
  }

  return hours;
}
