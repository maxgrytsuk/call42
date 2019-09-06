var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);
var widgetsFind = Q.nbind(db.widgets.find, db.widgets);
var widgetUpdate = Q.nbind(db.widgets.update, db.widgets);
exports.up = function(next){
  var widgetsSavePromises= [], channels, idx;
  widgetsFind()
    .then(function(widgets) {
      _.forEach(widgets, function(widget) {
        idx = 0, channels = [];
        _.forEach(widget.channels, function(channel) {
          channels.push({idx:idx, model:channel});
          idx += 1;
        });
        widgetsSavePromises.push(updateWidget(widget, channels));
      });
      return Q.allSettled(widgetsSavePromises)
    })
    .then(function(){
      next();
    })
    .done();
};


function updateWidget(widget, channels) {
  var def =  Q.defer();
  widgetUpdate({_id:widget._id}, {$set:{channels:channels}})
    .then(function(){
      def.resolve(Q());
    });
  return def.promise;
}

exports.down = function(next){
//no migrate down
  next();
};