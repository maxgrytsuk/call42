'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  _ = require('lodash'),
  Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate');

/**
 * Callback Request Schema
 */
var CallbackRequestSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  widget: {
    type: Schema.Types.ObjectId,
    ref: 'Widget'
  },
  data: {
    type: Object
  },
  guid: {
    type: String
  },
  result: {
    type: String
  },
  date: {
    type: String
  }
}, {collection : 'callback_requests'});

CallbackRequestSchema.plugin(deepPopulate, {
  populate: {
    'widget.user': {
      select: 'username email'
    }
  }
});

mongoose.model('CallbackRequest', CallbackRequestSchema);