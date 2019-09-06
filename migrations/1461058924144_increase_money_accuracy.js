var mongojs = require('mongojs'),
  Q = require('q'),
  _ = require('lodash'),
  config = require('../config/config');

var db = mongojs(config.db, ['prices', 'balance', 'payments', 'users', 'channels']);

exports.up = function(next){

  var promises = [];
  promises.push(
    Q.nbind(db.prices.update, db.prices)(
      {},
      {
        $mul: { price: 100 }
      },
      {
        multi:true
      }
    )
  );
  promises.push(
    Q.nbind(db.balance.update, db.balance)(
      {},
      {
        $mul: { money: 100, moneyCurrent: 100 }
      },
      {
        multi:true
      }
    )
  );
  promises.push(
    Q.nbind(db.payments.update, db.payments)(
      {},
      {
        $mul: { amount: 100 }
      },
      {
        multi:true
      }
    )
  );
  promises.push(
    Q.nbind(db.users.update, db.users)(
      {},
      {
        $mul: { money: 100 }
      },
      {
        multi:true
      }
    )
  );
  promises.push(
    Q.nbind(db.channels.update, db.channels)(
      {},
      {
        $mul: { price: 100 }
      },
      {
        multi:true
      }
    )
  );
  Q.all(promises)
    .then(function() {
      next();
    })
    .fail(function(err) {
      console.log(err);
    })
  ;

};

exports.down = function(next){
  next();
};
