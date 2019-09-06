'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Base Channel Settings Schema
 */
var dateFrom = {hours:'00', minutes:'00'};
var dateTo = {hours:'24', minutes:'00'};
var ChannelSettingsBaseSchema = new Schema({
  type: {
    type: String
  },
  name: {
    type: String,
    default: '',
    trim: true,
    max: 500,
    min: 3,
    required: ''
  },
  idWidget: {
    type: Schema.Types.ObjectId
  },
  isEnabled: {
    type: Boolean,
    default:true
  },
  price: {
    type: Number
  },
  skipOnSuccess: {
    type: Boolean,
    default:false
  },
  sendIfOffline: {
    type: Boolean,
    default:null//possible values null/true/false
  },
  workTime: {
    type: Object,
    default:[
      {idx:1,day:'mo',available:true, from:dateFrom, to:dateTo},
      {idx:2,day:'tu',available:true, from:dateFrom, to:dateTo},
      {idx:3,day:'we',available:true, from:dateFrom, to:dateTo},
      {idx:4,day:'th',available:true, from:dateFrom, to:dateTo},
      {idx:5,day:'fr',available:true, from:dateFrom, to:dateTo},
      {idx:6,day:'sa',available:true, from:dateFrom, to:dateTo},
      {idx:7,day:'su',available:true, from:dateFrom, to:dateTo}
    ]
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: new Date()
  }
}, { collection : 'channels', discriminatorKey : 'type' });

mongoose.model('ChannelSettings', ChannelSettingsBaseSchema);
module.exports = ChannelSettingsBaseSchema;