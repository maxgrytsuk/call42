'use strict';

var phoneCodes = require('../data/phoneCodes'),
  _ = require('lodash');

var Detector = Object.create(this);
module.exports = Detector;

Detector.lib = require('geoip-ultralight');

Detector.getPhoneCodeData = function(ip) {
  var country = this.lib.lookupCountry(ip);
  var phoneCodeData = _.find(phoneCodes.data, function(item) {
    return item.cc === country;
  });
  return phoneCodeData;
};

Detector.extractPhoneCodePrefix = function(phoneCodeMask) {
  var phoneCodePrefix = '+',
    delimiter;
  if (phoneCodeMask) {
    if(phoneCodeMask.indexOf('(') !== -1) {
      delimiter = '(';
    } else {
      delimiter = '-';
    }
    phoneCodePrefix = phoneCodeMask.split(delimiter)[0];
  }
  return phoneCodePrefix;
};

Detector.removeDelimiters = function (phoneCode) {
  return phoneCode.replace(/\(|\)|-/g, '');
};

Detector.detectCountry = function(ip) {
  var country = this.lib.lookupCountry(ip);
  return country?country:'UA';
};

Detector.detectLanguage = function(ip) {
  var detectedLang = this.lib.lookupCountry(ip);
  var isRusLang = _.find(['RU','UA','AZ','BY','GE','KZ','MD','TM','UZ','AM','KG','TJ'], function(lang) {
    return detectedLang === lang;
  });
  return isRusLang?'ru':'en';
};

exports.setLibrary = function(lib) {
  this.lib = lib;
};
