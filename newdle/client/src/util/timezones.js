import _ from 'lodash';
import moment from 'moment';
import preval from 'preval.macro';
import 'moment-timezone';

const commonTzSet = preval`
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

  module.exports = commonTzSet;
`;

const timezones = Object.keys(commonTzSet).map(k => {
  const zone = moment.tz.zone(k);
  const dt = moment.tz(k);
  return {
    name: zone.name,
    offset: zone.utcOffset(+new Date()),
    caption: dt.zoneAbbr().match(/^[+-]\d+$/) ? dt.format('Z') : dt.format('z (Z)'),
  };
});

// List with all timezones and their respective offsets.
export const commonTimezones = _.sortBy(timezones, ['offset', 'caption']);
