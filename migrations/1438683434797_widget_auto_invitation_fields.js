var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);

exports.up = function(next){

  db.widgets.update(
    {},
    {
      $rename: {
              'public.activate_time': 'public.auto_invitation.activate_time',
              'public.activate_page_limit': 'public.auto_invitation.activate_page_limit',
              'public.activate_page_limit_time': 'public.auto_invitation.activate_page_limit_time'
              },
      $set:{
        'public.auto_invitation.is_enabled':true
      }
    },
    {
      multi: true
    }
    ,function() {
      next();
    })

};

exports.down = function(next){
//no migrate down
  next();
};
