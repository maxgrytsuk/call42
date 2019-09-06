var mongojs = require('mongojs'),
  Q = require('q'),
  _ = require('lodash'),
  config = require('../config/config');

var db = mongojs(config.db, ['users', 'currencies', 'prices']);

exports.up = function(next){
  var insertPrices,usersUpdate;
  var currenciesRunCommand = Q.nbind(db.currencies.runCommand, db.currencies);
  var currenciesFind = Q.nbind(db.currencies.find, db.currencies);
  var currencyIds = {};

  currenciesRunCommand('insert', {
      documents: [
        { name: "UAH" },
        { name: "RUB" },
        { name: "USD" }
      ],
      ordered: true
    }
  )
    .then(function(){
      return currenciesFind();
    })
    .then(function(currencies) {
      _.forEach(currencies, function(currency) {
        currencyIds[currency.name] = currency._id;
      });
      insertPrices = Q.nbind(db.prices.runCommand, db.prices)('insert', {
          documents: [
            { notification_type: "ASTERISK", price:80, currency:currencyIds.UAH},
            { notification_type: "ASTERISK", price:200, currency:currencyIds.RUB},
            { notification_type: "ASTERISK", price:15, currency:currencyIds.USD},
            { notification_type: "SMS", price:70, currency:currencyIds.UAH},
            { notification_type: "SMS", price:170, currency:currencyIds.RUB},
            { notification_type: "SMS", price:12, currency:currencyIds.USD},
            { notification_type: "INTERNET", price:50, currency:currencyIds.UAH},
            { notification_type: "INTERNET", price:150, currency:currencyIds.RUB},
            { notification_type: "INTERNET", price:10, currency:currencyIds.USD}
          ],
          ordered: true
        }
      );
      usersUpdate = Q.nbind(db.users.update, db.users)({}, {
          $set:{
            currency:currencyIds.UAH,
            money:3000,
            notifications:42,
            notifications_max:42
          }
        }, {multi: true}
      );
      return Q.allSettled([insertPrices, usersUpdate]);
    })
    .then(function() {
      next();
    });
};

exports.down = function(next){
  next();
};
