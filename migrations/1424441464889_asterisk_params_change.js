var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);

exports.up = function(next){
  db.widgets.update(
    {},
    {
      $unset:{
        'channels.asterisk.peers':''
      },
      $set:{
        'channels.asterisk.destination': 'ivr-test, 900, 1',
        'channels.asterisk.check_active_peers': '103, 104'
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
