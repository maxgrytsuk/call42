var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);

var widgetName = 'test';

exports.up = function(next){
  db.widgets.update(
    {
      name: widgetName
    },
    {
      $set:{
        "channels.asterisk.port": 15178,
        "channels.asterisk.user": 'zEdkZqI2BC1I4Tnd',
        "channels.asterisk.secret": 'MDAAVde987ArGPKm'
      }
    },
    function() {
      next();
    }
  )
};

exports.down = function(next){
//no migrate down
  next();
};
