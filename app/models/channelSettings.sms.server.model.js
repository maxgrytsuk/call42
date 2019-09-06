'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  extend = require('mongoose-schema-extend'),
  ChannelSettingsBaseSchema = require('../models/channelSettings.base.server.model');

/**
 * Sms Channel Settings Schema
 */
var ChannelSettingsSmsSchema = ChannelSettingsBaseSchema.extend({
  nativeParams: {
    service: {
      type: String
    },
    phone:{
      type: Object
    }
  }
});

ChannelSettingsSmsSchema.virtual('checkers').get(function(){
  return ['CheckerEnabled', 'CheckerSkipOnSuccess', 'CheckerWorkTime', 'CheckerBalance'];
});

module.exports = mongoose.model('sms', ChannelSettingsSmsSchema);