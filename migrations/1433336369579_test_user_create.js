var mongojs = require('mongojs'),
  crypto = require('crypto'),
  config = require('../config/config');

var db = mongojs(config.db, ['users']);

var username = 'test',
  password = 'test',
  email = 'test@algo-rithm.com';

exports.up = function(next){
  //see user.server.model
  var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64').toString();
  var passwordHashed = crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  var user = {
    username:username,
    password:passwordHashed,
    salt:salt,
    email: email,
    provider: 'local',
    roles : [ "user" ],
    created: new Date()
  };
  db.users.insert(user, function() {
    next();
  });
};

exports.down = function(next){
  db.users.remove({username:username}, function(){
    next();
  });
};
