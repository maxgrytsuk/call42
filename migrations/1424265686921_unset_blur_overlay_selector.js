var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);

exports.up = function(next){
  db.widgets.update(
    {},
    {
      $unset:{
        "public.blur_overlay_selector": ''
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
