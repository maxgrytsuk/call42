var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['accruals']);

exports.up = function(next){

  var accrualsDrop = Q.nbind(db.accruals.drop, db.accruals);
  accrualsDrop()
    .then(function() {
      next();
    }).fail(function(){
      next();
    })
  ;
};

exports.down = function(next){
  next();
};