var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);

exports.up = function(next){
  db.widgets.update(
    {},
    {
      $unset:{
        'channels.asterisk.routing':''
      },
      $set:{
        'channels.asterisk.routes': [
          {phonePrefix:'+380', channel:'SIP/GSM-UKR'},
          {phonePrefix:'+7', channel:'SIP/MAGIC'}
        ]
      }
    },
    {
      multi: true
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
