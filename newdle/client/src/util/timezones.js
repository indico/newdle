import preval from 'preval.macro';
import 'moment-timezone';

// This will just generate a pre-compiled list with all timezones and their
// respective offsets.
export const commonTimezones = preval`
  require('moment-timezone');
  const moment = require('moment');
  const _ = require('lodash');

  const tzData = require('moment-timezone/data/meta/latest.json');
  const commonTzSet = Object.entries(tzData.countries).reduce((accum, [key, {zones}]) => {
    zones.forEach(tz => {
      accum[tz] = true;
    })
    return accum;
  }, {});

  // add some common timezones which are not official in any country
  [
    // UTC/GMT
    'UTC',
    'GMT',
    // USA
    'US/Eastern', 'US/Pacific', 'US/Mountain',
    'US/Central', 'US/Arizona', 'US/Hawaii', 'US/Alaska',
    // Canada
    'Canada/Newfoundland', 'Canada/Atlantic', 'Canada/Eastern',
    'Canada/Central', 'Canada/Mountain', 'Canada/Pacific'
  ].forEach(k => {
    commonTzSet[k] = true;
  });

  const timezones = Object.keys(commonTzSet).map(k => {
    const zone = moment.tz.zone(k);
    const dt = moment.tz(k);
    return {
      name: zone.name,
      offset: zone.utcOffset(+ new Date()),
      caption: dt.zoneAbbr().match(/^[+-]\\d+$/) ? dt.format('Z') : dt.format('z (Z)')
    }
  });
  module.exports = _.sortBy(timezones, ['offset', 'caption']);
`;
