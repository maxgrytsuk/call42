var mongojs = require('mongojs'),
  Q = require('q'),
  _ = require('lodash'),
  config = require('../config/config');

var db = mongojs(config.db, ['prices']);

exports.up = function(next){

    Q.nbind(db.prices.update, db.prices)(
      {
        notification_type:'INTERNET'
      },
      {
        $set:{
          notification_type:'EMAIL'
        }
      }, {multi: true}
    )
    .then(function() {
      next();
    });
};

exports.down = function(next){
  next();
};
