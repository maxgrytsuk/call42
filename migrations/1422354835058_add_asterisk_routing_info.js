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
      $unset:{
        "channels.asterisk.ukrChannel": '',
        "channels.asterisk.internationalChannel": ''
      },
      $set:{
        "channels.asterisk.routing": {
          '+380':'extra/1',
          '+7':'SIP/74997099321-voip.mtt.ru'
        }
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
