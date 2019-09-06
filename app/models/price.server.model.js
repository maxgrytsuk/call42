'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Price Schema
 */
var PriceSchema = new Schema({
  currency: {
    type: Schema.Types.ObjectId,
    ref:'Currency'
  },
  notification_type: {
    type: String //One of [‘Email’, ‘SMS’, ‘Asterisk’]
  },
  price: {
    type: Number
  }
});

mongoose.model('Price', PriceSchema);