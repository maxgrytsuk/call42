var mongojs = require('mongojs'),
  crypto = require('crypto'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['users', 'channels', 'widgets']);

var username = 'call42',
  widgetName = 'call42',
  password = 'call73bAck74',
  email = 'info@algo-rithm.com';

exports.up = function(next){
  //see user.server.model
  var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64').toString();
  var passwordHashed = crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  var user = {
    username:username,
    password:passwordHashed,
    salt:salt,
    email: email,
    provider: 'local',
    roles : [ 'user' ],
    created: new Date()
  };
  var widgetData = {
    'name' : widgetName,
    'channels' : [],
    'urls' : config.call42WidgetHost
  };
  var asteriskChannelData = {
    'type' : 'asterisk',
    'name' : 'asteriskCall42',
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
  var emailChannelData = {
    'type' : 'email',
    'name' : 'emailCall42',
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

  var userInsert = Q.nbind(db.users.insert, db.users);
  var widgetInsert = Q.nbind(db.widgets.insert, db.widgets);
  var channelInsert = Q.nbind(db.channels.insert, db.channels);

  var userFind = Q.nbind(db.users.findOne, db.users);
  var widgetFind = Q.nbind(db.widgets.findOne, db.widgets);
  var channelFind = Q.nbind(db.channels.findOne, db.channels);

  var widgetUpdate = Q.nbind(db.widgets.update, db.widgets);

  var asteriskChannelId, emailChannelId, widgetId;
  userInsert(user)
    .then(function(){
      return userFind({username:username});
    })
    .then(function(user) {
      widgetData.user = user._id;
      return widgetInsert(widgetData);
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