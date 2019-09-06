var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);

exports.up = function(next){
  var testPeers = [
      {name:'all', number:900},
      {name:'103',number:903},
      {name:'104',number:904}
    ],
    pawnshopPeers = [
      {name:'all', number:900},
      {name:'101',number:901},
      {name:'102',number:902}
    ];
  updatePeers('test', testPeers, function() {
    updatePeers('pawnshop', pawnshopPeers, function() {
      next();
    })
  })
};

exports.down = function(next){
//no migrate down
  next();
};

function updatePeers(name, peers, callback) {
  db.widgets.update(
    {
      name: name
    },
    {
      $set:{
        'channels.asterisk.peers': peers
      }
    },
    function() {
      callback();
    }
  )
}
