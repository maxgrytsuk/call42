var mongojs = require('mongojs'),
  Q = require('q'),
  _ = require('lodash'),
  config = require('../config/config');

var db = mongojs(config.db, ['currencies']);

exports.up = function(next){
  var currencyUpdatePromises = [], country;
  var findAndModifyCurrency = Q.nbind(db.currencies.findAndModify, db.currencies);
  var currenciesFind = Q.nbind(db.currencies.find, db.currencies);

  var countries = {UAH:'UA', RUB:'RU', USD:''};
  currenciesFind()
    .then(function(currencies) {
      _.forEach(currencies, function(currency) {
        country = countries[currency.name];
        currencyUpdatePromises.push(findAndModifyCurrency({
          query:{name:currency.name},
          update:{$set:{country:country}}
        }));
      });
      return Q.allSettled(currencyUpdatePromises);
    })
    .then(function() {
      next();
    })
};

exports.down = function(next){
  next();
};
