'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  validator = require('validator'),
  Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate');
var dateFrom = {hours:'00', minutes:'00'};
var dateTo = {hours:'24', minutes:'00'};

var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
function validateUrlList(list) {
  var urls = list.split(',');
  var result = urls.every(function(url) {
    //return validator.isURL(url.trim());
    return URL_REGEXP.test(url.trim());
  });
  return result;
}

/**
 * Widget Schema
 */
var WidgetSchema = new Schema({
  name: {
    type: String,
    default: '',
    trim: true,
    max: 500,
    min: 3,
    required: 'required'
  },
  urls: {
    type: String,
    default: '',
    trim: true,
    max:500,
    required: 'required',
    validate: [validateUrlList, 'invalid urls format']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref:'User'
  },
  channels:[{
    model: { type: Schema.Types.ObjectId, ref: 'ChannelSettings' },
    idx: Number
  }],
  public:{
    auto_invitation:{
      is_enabled: {
        type: Boolean,
        default:true
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
      mode: {
        type: String,
        default: 'BY_SCHEDULE'
      },
      activate_time: {
        type: Number,
        default: 90
      },
      activate_page_limit:{
        type: Number,
        default: 3
      },
      activate_page_limit_time:{
        type: Number,
        default: 10
      }
    },
    selectors: {
      type: String,
      default: '',
      trim: true,
      max:500
    },
    texts: {
      dialog_automatic: {
        type: String ,
        default: 'DIALOG_AUTOMATIC'
      },
      dialog_button: {
        type: String ,
        default: 'DIALOG_BUTTON'
      },
      dialog_button_on_connect: {
        type: String ,
        default: 'DIALOG_BUTTON_ON_CONNECT'
      },
      dialog_connection_check: {
        type: String ,
        default: 'DIALOG_CONNECTION_CHECK'
      },
      dialog_connection_failure: {
        type: String ,
        default: 'DIALOG_CONNECTION_FAILURE'
      },
      dialog_connection_impossible: {
        type: String ,
        default: 'DIALOG_CONNECTION_IMPOSSIBLE'
      },
      dialog_error: {
        type: String ,
        default: 'DIALOG_ERROR'
      },
      dialog_on_offline: {
        type: String ,
        default: 'DIALOG_ON_OFFLINE'
      },
      dialog_on_online: {
        type: String,
        default: 'DIALOG_ON_ONLINE'
      },
      dialog_phone_number_placeholder: {
        type: String ,
        default: 'DIALOG_PHONE_NUMBER_PLACEHOLDER'
      },
      dialog_thank_you: {
        type: String ,
        default: 'DIALOG_THANK_YOU'
      },
      dialog_validation_failure: {
        type: String ,
        default: 'DIALOG_VALIDATION_FAILURE'
      }
    }
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

WidgetSchema.plugin(deepPopulate,{
  populate: {
    'user.currency': {
      select: 'name'
    }
  }
});

mongoose.model('Widget', WidgetSchema);