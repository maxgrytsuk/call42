'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate');

/**
 * Balance Schema
 */
var BalanceSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.Types.ObjectId,
    ref:'User'
  },
  notification: {
    type: Schema.Types.ObjectId,
    ref:'Notification'
  },
  payment: {
    type: Schema.Types.ObjectId,
    ref:'Payment'
  },
  cost: {
    type: Number
  },
  money: {
    type: Number
  },
  free: {
    type: Number
  },
  moneyCurrent: {
    type: Number
  },
  freeCurrent: {
    type: Number
  },
  type: {
    type: String
  },
  info: {
    type: String
  },
  date:{
    type: String
  }
}, {collection : 'balance'});

BalanceSchema.plugin(deepPopulate,{
  populate: {
    'notification.callbackRequest.widget': {
      select: 'name'
    },
    'notification': {
      select: 'channelData callbackRequest'
    }
  }
});

mongoose.model('Balance', BalanceSchema);