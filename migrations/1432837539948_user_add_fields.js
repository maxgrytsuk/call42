var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['users']);

exports.up = function(next){
  db.users.update(
    {},
    {
      $set: {
      'lang': 'en' ,
      'timezone': 'GMT'
      } },
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
