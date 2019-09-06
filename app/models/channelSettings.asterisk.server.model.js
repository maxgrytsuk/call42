'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  extend = require('mongoose-schema-extend'),
  ChannelSettingsBaseSchema = require('../models/channelSettings.base.server.model');

/**
 * Asterisk Channel Settings Schema
 */
var ChannelSettingsAsteriskSchema = ChannelSettingsBaseSchema.extend({
  nativeParams: {
    host: {
      type: String,
      trim: true,
      required: 'required'
    },
    port: {
      type: Number,
      min:1,
      max:99999,
      trim: true,
      required: 'required'
    },
    user: {
      type: String,
      trim: true,
      required: 'required'
    },
    secret: {
      type: String,
      trim: true
    },
    callMethod:{
      type: String,
      required: '',
      default:'1'
    },
    method1Params: {
      peer : {
        type: String,
        trim: true
      },
      context : {
        type: String,
        trim: true
      }
    },
    method2Params: {
      checkActivePeers: {
        type: String,
        trim: true
      },
      destination: {
        type: String,
        trim: true
      },
      routes: {
        type: Array
      },
      excludedPrefixes:{
        type: String
      }
    }
  }
});

ChannelSettingsAsteriskSchema.virtual('checkers').get(function(){
  return ['CheckerEnabled', 'CheckerSkipOnSuccess', 'CheckerWorkTime', 'CheckerExcludedPrefixes', 'CheckerAsteriskStatus', 'CheckerOnline', 'CheckerBalance'];
});

module.exports = mongoose.model('asterisk', ChannelSettingsAsteriskSchema);