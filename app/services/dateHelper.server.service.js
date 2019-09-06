'use strict';
var moment_tz = require('moment-timezone'),
  moment = require('moment'),
_ = require('lodash');

exports.getDateByTimeZone = function(date, timezone, format) {
  if (!format) {
    format = 'DD-MM-YYYY HH:mm';
  }
  return moment_tz(date).tz(timezone).format(format).toLowerCase();
};

exports.getISODateFromNowByPeriod = function(now, period) {
  var timestamp = now - period * 1000,
    date = new Date(timestamp);
  return date.toISOString();
};

exports.setDatesByTimezone = function(data, timezone) {
  var self = this;
  _.forEach(data, function(item) {
    item.date = self.getDateByTimeZone(item.created, timezone);
  });
  return data;
};

exports.addDay = function(date, day) {
  return moment(date).add(day, 'd').toDate();
};

exports.getDay = function(date) {
  return moment(date).format('DD-MM-YYYY');
};