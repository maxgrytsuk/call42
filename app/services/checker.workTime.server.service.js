'use strict';

var Q = require('q'),
  moment = require('moment-timezone'),
  _ = require('lodash'),
  CheckerBase = require('../services/checker.base.server.service');

var CheckerWorkTime = Object.create(CheckerBase);
module.exports = CheckerWorkTime;

CheckerWorkTime.check = function() {
  var def = Q.defer();
  if (this.isWorkTime({workTime:this.channelSettings.workTime, timezone:this.user.timezone})) {
    def.resolve();
  } else {
    def.reject({code:this.statuses.beyondWorkTime});
  }
  return def.promise;
};

CheckerWorkTime.isWorkTime = function(spec) {
  var userMoment = moment(this.getDateNow()).tz(spec.timezone),
    dayNow = userMoment.format('dd').toLowerCase(),
    workTimeSettings = _.find(spec.workTime, function(settings) {
      return settings.day === dayNow;
    });

//[{idx:1,day:'mo',available:true},{idx:2,day:'tu',available:true, from:{hours:'09', minutes:'00'}, 'to':{hours:'19', minutes:'00'}}...]
  if (workTimeSettings && workTimeSettings.available) {
    var timeFromH = parseInt(workTimeSettings.from.hours),
      timeFromM = parseInt(workTimeSettings.from.minutes),
      timeToH = parseInt(workTimeSettings.to.hours),
      timeToM = parseInt(workTimeSettings.to.minutes);

      var timeNow = this.getTime(userMoment.format('HH:mm'));
      return  (timeNow.h > timeFromH && timeNow.h < timeToH) ||
        (timeFromH === timeToH && timeFromM === timeToM) ||//24 hours a day
        (timeNow.h === timeFromH && timeNow.m > timeFromM) ||
        (timeNow.h === timeToH && timeNow.m < timeToM)
        ;

  } else {
    return false;
  }
};

CheckerWorkTime.getTime = function(time) {
  var arr = time.split(':');
  if (arr.length === 2) {
    return {h:parseInt(arr[0]),m:parseInt(arr[1])};
  } else {
    throw new Error('Wrong time format');
  }
};

CheckerWorkTime.getDateNow = function() {
  if (!this.dateNow) {
    this.dateNow = new Date().toISOString();
  }
  return this.dateNow;
};

CheckerWorkTime.setDateNow = function(date) {
  this.dateNow = date;
};