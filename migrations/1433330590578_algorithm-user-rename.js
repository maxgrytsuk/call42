var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['users']);

exports.up = function(next){

  db.users.update(
    {},
    {
      $set:{
        username: 'algo-rithm'
      }
    },
    function() {
      next();
    }
  );

};

exports.down = function(next){
//no migrate down
  next();
};
