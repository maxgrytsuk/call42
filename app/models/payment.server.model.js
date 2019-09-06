'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Payment Schema
 */
var PaymentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref:'User'
  },
  amount: {
    type: Number
  },
  currency: {
    type: Schema.Types.ObjectId,
    ref:'Currency'
  },
  status: {
    type: String
  },
  service: {
    type: String
  },
  info: {
    type: Object
  },
  created: {
    type: Date,
    default: Date.now
  },
  date:{
    type:String
  }
});

mongoose.model('Payment', PaymentSchema);