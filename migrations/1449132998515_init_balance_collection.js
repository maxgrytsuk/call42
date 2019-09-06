var mongojs = require('mongojs'),
  _ = require('lodash'),
  Q = require('q'),
  config = require('../config/config');

var db = mongojs(config.db, ['users', 'balance']);

exports.up = function(next){

  var balanceInsert = Q.nbind(db.balance.insert, db.balance);
  var usersFind = Q.nbind(db.users.find, db.users);
  var balanceInsertPromises = [];
  usersFind()
    .then(function(users) {
      _.forEach(users, function(user) {
        balanceInsertPromises.push(balanceInsert({
          created:new Date(),
          user:user._id,
          notification:null,
          money:user.money,
          moneyCurrent:user.money,
          free:user.notifications,
          freeCurrent:user.notifications,
          type:'initialization',
          info:'initialization #12250'
        }))
      });
      return Q.allSettled(balanceInsertPromises);
    })
    .then(function() {
      next();
    });
};

exports.down = function(next){
  next();
};