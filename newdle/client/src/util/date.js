import moment, {HTML5_FMT} from 'moment';

export const DEFAULT_TIME_FORMAT = 'HH:mm';

export function toMoment(date, format = null, tz = null) {
  if (!date) {
    return null;
  }
  return tz ? moment.tz(date, format, tz) : moment(date, format);
}

export function serializeDate(date, format = HTML5_FMT.DATE, tz = null) {
  const dateMoment = tz ? moment.tz(date, tz) : moment(date);
  return dateMoment.format(format);
}

export function overlaps([start1, end1], [start2, end2]) {
  return start1.isBefore(end2) && start2.isBefore(end1);
}

export function getHourSpan(input) {
  const {timeSlots, defaultHourSpan, defaultMinHour, defaultMaxHour, duration, format} = input;
  const timeSlotsMoment = timeSlots.map(c => toMoment(c, format));
  const minTimelineHour = Math.min(...timeSlotsMoment.map(timeSlot => timeSlot.hour()));
  const maxTimeline = moment
    .max(
      timeSlotsMoment.map(timeSlot => moment({hour: timeSlot.hour(), minutes: timeSlot.minutes()}))
    )
    .clone()
    .add(duration, 'm');

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

export function getInitialUserTimezone() {
  return localStorage.getItem('chosenTimezone') || moment.tz.guess();
}

export function getInitialLanguage() {
  return localStorage.getItem('userLanguage') || navigator.language.substring(0, 2);
}
