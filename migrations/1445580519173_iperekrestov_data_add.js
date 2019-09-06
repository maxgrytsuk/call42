var mongojs = require('mongojs'),
  crypto = require('crypto'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['users', 'channels', 'widgets']);

var username = 'iperekrestov',
  widgetName = 'widgetPerekresov';

exports.up = function(next){

  var widgetData = {
    'name' : widgetName,
    'channels' : [],
    'urls' : ''
  };
  var asteriskChannelData = {
    'type' : 'asterisk',
    'name' : 'asteriskPerekresov',
    'isEnabled' : true,
    'sendIfOffline' : false,
    'skipOnSuccess' : false,
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
      'host' : 'voip.algo-rithm.com',
      'port' : 12178,
      'user' : 'zEdkZqI2BC1I4Tnd',
      'secret' : 'MDAAVde987ArGPKm',
      'destination' : 'ivr, 901, 1',
      'check_active_peers' : '',
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
      'excludedPrefixes' : ''
    }
  };
  var emailChannelData = {
    'type' : 'email',
    'name' : 'emailPerekresov',
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
      'emails' : ''
    }

  };

  var widgetInsert = Q.nbind(db.widgets.insert, db.widgets);
  var channelInsert = Q.nbind(db.channels.insert, db.channels);

  var userFind = Q.nbind(db.users.findOne, db.users);
  var widgetFind = Q.nbind(db.widgets.findOne, db.widgets);
  var channelFind = Q.nbind(db.channels.findOne, db.channels);

  var widgetUpdate = Q.nbind(db.widgets.update, db.widgets);

  var asteriskChannelId, emailChannelId, widgetId;

  userFind({username:username})
    .then(function(user) {
      if (!user) {
        next();
      } else {
        widgetData.user = user._id;
        return widgetInsert(widgetData);
      }
    })
    .then(function(){
      return widgetFind({name:widgetName});
    })
    .then(function(widget) {
      asteriskChannelData.idWidget = widget._id;
      emailChannelData.idWidget = widget._id;
      return channelInsert([asteriskChannelData, emailChannelData]);
    })
    .then(function() {
      return channelFind({name:asteriskChannelData.name});
    })
    .then(function(channel) {
      asteriskChannelId = channel._id;
      return channelFind({name:emailChannelData.name});
    })
    .then(function(channel){
      emailChannelId = channel._id;
      return widgetUpdate({name:widgetName}, {$set:{channels:[asteriskChannelId, emailChannelId]}});
    })
    .then(function() {
      next();
    });

};

exports.down = function(next){
  next();
};
