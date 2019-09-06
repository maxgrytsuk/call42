'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Currency Schema
 */
var CurrencySchema = new Schema({
  name: {
    type: String // [‘$’, ‘UAH’, ‘RUB’]
  }
});

mongoose.model('Currency', CurrencySchema);