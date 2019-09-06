var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets', 'channels']);

exports.up = function(next){
  var widgetsFind = Q.nbind(db.widgets.find, db.widgets),
    updateWidgetPromises = [];

  widgetsFind()
    .then(function(widgets) {
      _.forEach(widgets, function(widget) {
        updateWidgetPromises.push(updateWidget(widget))
      });
      return Q.allSettled(updateWidgetPromises);
    })
    .then((function() {
      next();
    }))
    .done();

};

exports.down = function(next){
//no migrate down
  next();
};

function updateWidget(widget) {
  var def =  Q.defer();
  var asteriskChannelSettingsId;
  var emailChannelSettingsId;
  delete widget.channels.asterisk.enabled;

  var asteriskChannelSettings = {
    type: 'asterisk',
    name: 'asterisk',
    idWidget: widget._id,
    isEnabled: true,
    sendIfOffline: false,
    skipOnSuccess: false,//skip if sent before
    workTime: {
      "mo":{"from":"08:00","to":"18:30"},
      "tu":{"from":"08:00","to":"18:30"},
      "we":{"from":"08:00","to":"18:30"},
      "th":{"from":"08:00","to":"18:30"},
      "fr":{"from":"08:00","to":"18:30"},
      "sa":false,
      "su":false
    },
    created: new Date(),
    updated: new Date(),
    nativeParams: widget.channels.asterisk
  };

  db.channels.insert(asteriskChannelSettings, function(err, data) {
    asteriskChannelSettingsId = data._id;
    var emailChannelSettings = {
      type: 'email',
      name: 'email',
      idWidget: widget._id,
      isEnabled: true,
      skipOnSuccess: false,
      workTime: {mo:true,tu:true,we:true,th:true,fr:true,sa:true,su:true},
      created: new Date(),
      updated: new Date(),
      nativeParams: {
        emails:widget.channels.email.emails
      }
    };
    db.channels.insert(emailChannelSettings, function(err, data) {
      emailChannelSettingsId = data._id;
      db.widgets.update({
          name:widget.name
        },
        {
          $set:{
            'created': new Date(),
            'updated': new Date(),
            'channels': [asteriskChannelSettingsId, emailChannelSettingsId]
          }
        }, function() {
          def.resolve();
        })
    })
  });

  return def.promise;
}
