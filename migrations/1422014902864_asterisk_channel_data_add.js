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
        "channels.asterisk.ukrChannel": 'extra/1',
        "channels.asterisk.internationalChannel": 'SIP/74997099321-voip.mtt.ru'
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
