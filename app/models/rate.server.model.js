'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Rate Schema
 */
var RateSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  currencyFrom: {
    type: String
  },
  currencyTo: {
    type: String
  },
  rate: {
    type: Number
  }
});

mongoose.model('Rate', RateSchema);