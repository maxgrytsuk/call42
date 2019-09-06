var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);

exports.up = function(next){
  db.widgets.update(
    {},
    {
      $unset:{
        "channels.email.send_mail_on_success_call": ''
      },
      $set:{
        "channels.email.do_not_send_mail_on_success_call": true
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
