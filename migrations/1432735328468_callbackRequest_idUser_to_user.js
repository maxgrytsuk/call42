var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['callback_requests']);

exports.up = function(next){
  db.callback_requests.update(
    {},
    { $rename: { 'idUser': 'user' } },
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
