'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  Q = require('q'),
  CurrencyService = require('../services/currency.server.service')
  ;


describe('CurrencyService Unit Tests:', function() {

  describe('Method convert', function() {

    it('should be able to return not changed cost if currencies are the same', function(done) {

      var currencyService = CurrencyService.create();

      currencyService.convert({
        currencyFrom:'UAH',
        currencyTo:'UAH',
        cost:100
      }).then(function(cost) {
        cost.should.be.equal(100);
        done();
      }).done();
    });

    it('should be able to return correctly converted cost in direct conversion', function(done) {

      var currencyService = CurrencyService.create(),
        rateUAHRUB = 2.6161,
        costUAH = 100
        ;

      currencyService.getLatestRate = function() {
        var def = Q.defer();
          def.resolve({
            currencyFrom:'UAH',
            currencyTo:'RUB',
            rate: rateUAHRUB
          });
        return def.promise;
      };

      currencyService.convert({
        currencyFrom:'UAH',
        currencyTo:'RUB',
        cost:costUAH
      }).then(function(cost) {
        cost.should.be.equal(costUAH * rateUAHRUB);
        done();
      }).done();
    });

    it('should be able to return correctly converted cost in reversed conversion', function(done) {

      var currencyService = CurrencyService.create(),
        rateRUBUAH = 0.3822,
        costUAH = 100
        ;

      currencyService.getLatestRate = function() {
        var def = Q.defer();
        def.resolve({
          currencyFrom:'RUB',
          currencyTo:'UAH',
          rate: rateRUBUAH
        });
        return def.promise;
      };

      currencyService.convert({
        currencyFrom:'UAH',
        currencyTo:'RUB',
        cost:costUAH
      }).then(function(cost) {
        cost.should.be.equal(costUAH / rateRUBUAH);
        done();
      }).done();
    });

  });

});