var mongojs = require('mongojs'),
  crypto = require('crypto'),
  _ = require('lodash'),
  Q = require('q'),
  ObjectID = require('bson-objectid'),
  config = require('../config/config');

var db = mongojs(config.db, ['users', 'channels', 'widgets']);

var username = 'call42',
  widgetNameRu = 'call42',
  widgetNameEn = 'call42en'
  ;

exports.up = function(next){
  var dateFrom = {hours:'00', minutes:'00'};
  var dateTo = {hours:'24', minutes:'00'};
  var widgetDataEn = {
    'name' : widgetNameEn,
    'channels' : [],
    'urls' : config.call42WidgetHost
  };
  var asteriskChannelDataEn = {
    'type' : 'asterisk',
    'name' : 'asteriskCall42En',
    'isEnabled' : true,
    'sendIfOffline' : false,
    'skipOnSuccess' : false,
    'workTime' :[
      {idx:1,day:"mo",available:true, from:dateFrom, to:dateTo},
      {idx:2,day:"tu",available:true, from:dateFrom, to:dateTo},
      {idx:3,day:"we",available:true, from:dateFrom, to:dateTo},
      {idx:4,day:"th",available:true, from:dateFrom, to:dateTo},
      {idx:5,day:"fr",available:true, from:dateFrom, to:dateTo},
      {idx:6,day:"sa",available:true, from:dateFrom, to:dateTo},
      {idx:7,day:"su",available:true, from:dateFrom, to:dateTo}
    ],
    'nativeParams' : {
      'host' : 'voip.algo-rithm.com',
      'port' : 12178,
      'user' : 'zEdkZqI2BC1I4Tnd',
      'secret' : 'MDAAVde987ArGPKm',
      'destination' : 'ivr, 901, 1',
      'check_active_peers' : '105, 107',
      'routes' : [
        {
          'phonePrefix' : '+380',
          'channel' : 'SIP/GSM-UKR'
        },
        {
          'phonePrefix' : '+7',
          'channel' : 'SIP/MAGIC'
        }
      ],
      'excludedPrefixes' : '+7840\n\n    +79407\n    +79409\n\n    +7701\n    +7702\n\n    +7705\n\n    +7760\n    +7761\n\n    +7771\n    +7775\n    +7776\n    +7777\n    +7778\n\n    +7785\n    +7788\n\n    +77800050\n    +77809050\n\n    +77809001\n\n    +77905\n    +77908\n\n    +7762\n    +7763\n    +7764\n\n    +7954\n\n    +7929803\n    +7929805\n    +7929806\n    +7929807\n\n    +7929804\n    +7929808\n    +7929809\n\n    +7929810\n    +7929811\n    +7929812'
    }
  };
  var emailChannelDataEn = {
    'type' : 'email',
    'name' : 'emailCall42En',
    'isEnabled' : true,
    'skipOnSuccess' : true,
    'workTime' : {
      'mo' : true,
      'tu' : true,
      'we' : true,
      'th' : true,
      'fr' : true,
      'sa' : true,
      'su' : true
    },
    'nativeParams' : {
      'emails' : 'info@algo-rithm.com'
    }

  };

  var widgetInsert = Q.nbind(db.widgets.insert, db.widgets);
  var channelInsert = Q.nbind(db.channels.insert, db.channels);

  var userFind = Q.nbind(db.users.findOne, db.users);
  var widgetFind = Q.nbind(db.widgets.findOne, db.widgets);
  var channelFind = Q.nbind(db.channels.findOne, db.channels);

  var widgetUpdate = Q.nbind(db.widgets.update, db.widgets);

  var asteriskChannelEnId, emailChannelEnId;
  userFind({username:username})
    .then(function(user) {
      widgetDataEn.user = user._id;
      return widgetInsert(widgetDataEn);
    })
    .then(function(){
      return widgetFind({name:widgetNameEn});
    })
    .then(function(widget) {
      asteriskChannelDataEn.idWidget = widget._id;
      emailChannelDataEn.idWidget = widget._id;
      return channelInsert([asteriskChannelDataEn, emailChannelDataEn]);
    })
    .then(function() {
      return channelFind({name:asteriskChannelDataEn.name});
    })
    .then(function(channel) {
      asteriskChannelEnId = channel._id;
      return channelFind({name:emailChannelDataEn.name});
    })
    .then(function(channel){
      emailChannelEnId = channel._id;
      return widgetUpdate({name:widgetNameEn}, {
        $set:{
          channels:[{
            "idx" : 0,
            "model" : asteriskChannelEnId,
            "_id": ObjectID()
          },
            {
              "idx" : 1,
              "model" : emailChannelEnId,
              "_id": ObjectID()
            }]
        }
      });
    })
    .then(function(){
      return widgetUpdate({name:widgetNameRu}, {$set:{name:'call42ru'}});
    })
    .then(function() {
      next();
    });
};

exports.down = function(next){
  next();
};