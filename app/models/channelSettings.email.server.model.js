'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  extend = require('mongoose-schema-extend'),
  validator = require('validator'),
  _ = require('lodash'),
  ChannelSettingsBaseSchema = require('../models/channelSettings.base.server.model');

function validateEmailList(property) {
  var result = false;
  if (property) {
    var emails = property.split(',');
    _.forEach(emails, function(email) {
      result = validator.isEmail(email.trim());
    });
  }
  return result;
}

/**
 * Email Channel Settings Schema
 */
var ChannelSettingsEmailSchema = ChannelSettingsBaseSchema.extend({
  nativeParams: {
    emails: {
      type: String,
      default: '',
      trim: true,
      max: 500,
      validate: [{validator:validateEmailList, msg:'invalidEmailListFormat'}]
    }
  }
});

ChannelSettingsEmailSchema.virtual('checkers').get(function(){
  return ['CheckerEnabled', 'CheckerWorkTime', 'CheckerSkipOnSuccess', 'CheckerBalance'];
});

module.exports = mongoose.model('email', ChannelSettingsEmailSchema);