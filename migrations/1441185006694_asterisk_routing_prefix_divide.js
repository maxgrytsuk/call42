var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['channels']);

exports.up = function(next){
  db.channels.update(
    {
      'type':'asterisk'
    },
    {
      $set:{
        'nativeParams.routes':
          [
          {prefix:'+38', pattern:'0', channel:'SIP/GSM-UKR', description:''},
          {prefix:'', pattern:'+7', channel:'SIP/MAGIC', description:''}
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
