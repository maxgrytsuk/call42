'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  _ = require('lodash'),
  ChannelSettingsService = require('../services/channelSettings.server.service'),
  BillingServiceMock = require('../../app/tests/mocks/billing.server.service.mock')
  ;

/**
 * Unit tests
 */

describe('ChannelSettingsService Unit Tests:', function() {


  describe('Method getChannelPrice', function() {

    it('should be able to return correct channel price when cost more then 50% of channel price', function(done) {
      var cost = 50;
      var channelPrice = 70;
      var currency = 'UAH';
      var billingService = BillingServiceMock.create();
      billingService.prices.SMS = channelPrice;
      ChannelSettingsService.setBillingService((billingService));

      ChannelSettingsService.getChannelPrice({
        type:'SMS',
        cost:cost,
        currency:currency
      }).
        then(function(price) {
          price.should.be.equal(cost + channelPrice/2);
          done();
        })
        .done();

    });

    it('should be able to return correct channel price when cost less then 50% of channel price', function(done) {
      var cost = 20;
      var channelPrice = 70;
      var currency = 'UAH';
      var billingService = BillingServiceMock.create();
      billingService.prices.SMS = channelPrice;
      ChannelSettingsService.setBillingService((billingService));

      ChannelSettingsService.getChannelPrice({
        type:'SMS',
        cost:cost,
        currency:currency
      }).
        then(function(price) {
          price.should.be.equal(70);
          done();
        })
        .done();

    });

  });

});