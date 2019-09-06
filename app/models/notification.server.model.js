'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  _ = require('lodash'),
  Schema = mongoose.Schema;

/**
 * Notification Schema
 */
var NotificationSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  channelData: {
    type: Object
  },
  callbackRequest: {
    type: Schema.Types.ObjectId,
    ref: 'CallbackRequest'
  },
  success: {
    type: Boolean
  },
  idx: {
    type: Number
  },
  info: {
    message:String,
    code: String
  }
}, {collection : 'notifications'});


mongoose.model('Notification', NotificationSchema);