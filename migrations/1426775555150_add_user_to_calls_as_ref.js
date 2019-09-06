var mongojs = require('mongojs'),
  _ = require('lodash')
config = require('../config/config');

var db = mongojs(config.db, ['calls', 'users']);
var username = 'algorithm';
exports.up = function(next){

  // Adding algo-rithm user refs to call entries (at this moment only algo-rithm user is present).
  // From this moment user refs will be added to each call entry on save.
  db.users.findOne({
    username:username
  }, function(err, user) {
    db.calls.update(
      {
        user:null
      },
      {
        $set:{
          'user': user._id
        }
      },
      {
        multi: true
      },
      function() {
        next();
      }
    )
  });


};

exports.down = function(next){
//no migrate down
  next();
};
