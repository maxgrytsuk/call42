var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['calls', 'callback_requests', 'channels', 'widgets']);

exports.up = function(next){

  var callsFind = Q.nbind(db.calls.find, db.calls);

  var callInitChannelsPromises= [],
    callInitWidgetPromises = [],
    callbackRequestCreatePromises = [];

  callsFind()
    .then(function(calls) {
      _.forEach(calls, function(call) {
        callInitChannelsPromises.push(initCallWithChannels(call))
      });
      return Q.allSettled(callInitChannelsPromises)
    })
    .then(function(data) {
      _.forEach(data, function(item) {
        callInitWidgetPromises.push(initCallWithWidget(item.value))
      });
      return Q.allSettled(callInitWidgetPromises)
    })

    .then(function(data) {
      _.forEach(data, function(item) {
            callbackRequestCreatePromises.push(
              createCallbackRequest(item.value)
            )
      });
      return Q.allSettled(callbackRequestCreatePromises)
    })

    .then(function(){
      db.calls.drop();
      next();
    })
    .done();
};

var codes = {
  'CHANNEL_DISABLED':'STATUS_CHANNEL_DISABLED',
  'NO_ACTIVE_PEERS':'STATUS_NO_ACTIVE_PEERS',
  'NO_ROUTE':'STATUS_NO_ROUTE',
  'CALL_FAILURE':'STATUS_ORIGINATE_FAILURE',
  'CALL_SUCCESS':'STATUS_ORIGINATE_SUCCESS',
  'SEND_FAILURE': 'STATUS_SEND_FAILURE',
  'SEND_SUCCESS': 'STATUS_SEND_SUCCESS'
};

var channelsFind = Q.nbind(db.channels.find, db.channels);
function initCallWithChannels(call) {
  var def =  Q.defer();
    channelsFind({idWidget:call.widget})
    .then(function(channels){
      call.channels = channels;
      def.resolve(Q(call));
    });
  return def.promise;
}

var widgetFindOne = Q.nbind(db.widgets.find, db.widgets);
function initCallWithWidget(call) {
  var def =  Q.defer();
  widgetFindOne({_id:call.widget})
    .then(function(widget){
      call.widget = widget[0];
      def.resolve(Q(call));
    });
  return def.promise;
}
var callbackRequestInsert = Q.nbind(db.callback_requests.insert, db.callback_requests);
function createCallbackRequest(call) {
  var def =  Q.defer();
  callbackRequestInsert({
    widget:call.widget._id,
    user:call.user,
    created:call.created,
    data:{
      phone : call.phone,
      referer : call.widget.url
    },
    results:[
      {
        channel: getChannelId(call.channels, 'asterisk'),
        success: getCallbackRequestSuccessResult(call, 'asterisk'),
        info:{
          code:getCallbackRequestInfoCode(call, 'asterisk')
        }
      },
      {
        channel: getChannelId(call.channels, 'email'),
        success: getCallbackRequestSuccessResult(call, 'email'),
        info:{
          code:getCallbackRequestInfoCode(call, 'email')
        }
      }
    ]
  })
    .then(function(callbackRequest) {
      def.resolve(Q(callbackRequest[0]));
    });
  return def.promise;
}

function getChannelId(channels, type) {
  return _.find(channels, function(channel) {return channel.type === type})._id;
}

function getCallbackRequestSuccessResult(call, type) {
  return _.find(call.data, function(item) {return item.name === type}).success;
}

function getCallbackRequestInfoCode(call, type) {
  var oldCode = _.find(call.data, function(item) {return item.name === type}).info.code;
  return codes[oldCode];
}

exports.down = function(next){
//no migrate down
  next();
};