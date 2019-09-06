'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  ObjectID = require('bson-objectid'),
  BillingService = require('../services/billing.server.service'),
  UserServiceMock = require('../../app/tests/mocks/user.server.service.mock'),
  BalanceServiceMock = require('../../app/tests/mocks/balance.server.service.mock'),
  PaymentServiceMock = require('../../app/tests/mocks/payment.server.service.mock')
  ;

/**
 * Unit tests
 */
var config = {
  payment:{
    liqPay:{
      public_key:'1',
      private_key:'2'
    }
  }

};

describe('BillingService Unit Tests:', function() {
  beforeEach(function(done) {
    BillingService.setLiqPayConfig(config);
    done();
  });

  describe('Method getPaymentData', function() {

    it('should be able to return correctly formed data', function(done) {
      var amount = 100;
      var currency = 'UAH';
      var lang = 'ru';

      var res = BillingService.getPaymentData({
        amount:amount,
        currency:currency,
        lang:lang
      });
      should.exist(res.data);
      should.exist(res.signature);
      should.exist(res.orderId);
      done();
    });

  });

  describe('Method setPaymentStatus', function() {

    it('should be able to set payment status success, create balance item, update user account with given money amount', function(done) {
      var billingService = BillingService.create();

      var orderId = ObjectID.generate();
      var userId = ObjectID.generate();
      var userService = UserServiceMock.create();
      var user = {
        id:userId,
        money:0,
        notifications:0
      };
      userService.user = user;

      var paymentService = PaymentServiceMock.create();
      paymentService.payments = [{
        id:orderId,
        amount:0,
        user:user,
        status:'redirected'
      }];

      billingService.setUserService(userService);
      billingService.setPaymentService(paymentService);

      var balanceService = BalanceServiceMock.create();
      balanceService.setBalance({results:[]});
      billingService.setBalanceService(balanceService);

      billingService.setLiqPayConfig(config.payment.liqPay);

      var liqPayDataEncoded = billingService.getLigPayServiceResponseData({
        amount:1,
        currency:'UAH',
        orderId:orderId,
        status:'success'
      });
      billingService.setPaymentStatus(liqPayDataEncoded)
        .then(function() {
          var payments = billingService.getPaymentService().payments;
          payments[0].status.should.be.equal('success');
          var user = billingService.getUserService().user;
          user.money.should.be.equal(100);
          balanceService.balance.results[0].type.should.be.equal(balanceService.balanceTypes.moneyCardAccrual);
          balanceService.balance.results[0].money.should.be.equal(payments[0].amount);
          done();
        })
        .done();
    });

    it('should be able to set payment status failure, create balance item, do not update user account with given money amount', function(done) {
      var billingService = BillingService.create();

      var orderId = ObjectID.generate();
      var userId = ObjectID.generate();
      var userService = UserServiceMock.create();
      var user = {
        id:userId,
        money:10,
        notifications:0
      };
      userService.user = user;
      billingService.setUserService(userService);

      var paymentService = PaymentServiceMock.create();
      paymentService.payments = [{
        id:orderId,
        amount:0,
        user:user,
        status:'redirected'
      }];
      billingService.setPaymentService(paymentService);

      var balanceService = BalanceServiceMock.create();
      balanceService.setBalance({results:[]});
      billingService.setBalanceService(balanceService);

      billingService.setLiqPayConfig(config.payment.liqPay);

      var liqPayDataEncoded = billingService.getLigPayServiceResponseData({
        amount:1,
        currency:'UAH',
        orderId:orderId,
        status:'failure'
      });
      billingService.setPaymentStatus(liqPayDataEncoded)
        .then(function() {
          var payments = billingService.getPaymentService().payments;
          payments[0].status.should.be.equal('failure');
          payments[0].info.amount.should.be.equal(1);

          billingService.getUserService().user.money.should.be.equal(user.money);

          var balanceItem =  balanceService.balance.results[0];
          balanceItem.type.should.be.equal(balanceService.balanceTypes.moneyCardAccrual);
          balanceItem.money.should.be.equal(0);
          balanceItem.moneyCurrent.should.be.equal(user.money);
          done();
        })
        .done();
    });

    it('should not be able to update user account with money when wrong signature provided', function(done) {
      var billingService = BillingService.create();

      var orderId = ObjectID.generate();
      var userId = ObjectID.generate();
      var userService = UserServiceMock.create();
      var user = {
        id:userId,
        money:0,
        notifications:0
      };
      userService.user = user;
      billingService.setUserService(userService);

      var paymentService = PaymentServiceMock.create();
      paymentService.payments = [{
        id:orderId,
        money:0,
        user:user,
        status:'redirected'
      }];
      billingService.setPaymentService(paymentService);
      billingService.setLiqPayConfig( {
        public_key:'1',
        private_key:'wrong_private_key'
      });

      var liqPayDataEncoded = billingService.getLigPayServiceResponseData({
        amount:1,
        currency:'UAH',
        orderId:orderId
      });
      billingService.setPaymentStatus(liqPayDataEncoded)
        .fin(function(){
          var payments = billingService.getPaymentService().payments;
          payments[0].status.should.be.equal('redirected');
          var user = billingService.getUserService().user;
          user.money.should.be.equal(0);
          done();
        })
        .done();
    });

  });

  describe('Method checkLiqPayData', function() {

    it('should be able to return error when wrong signature provided', function(done) {
      var billingService = BillingService.create();
      billingService.setLiqPayConfig( {
        public_key:'1',
        private_key:'wrong_private_key'
      });

      var liqPayDataEncoded = billingService.getLigPayServiceResponseData({
        amount:1,
        currency:'UAH',
        orderId:'1'
      });

      var res = null;
      billingService.setLiqPayConfig(config.payment.liqPay);

      billingService.checkLiqPayData(liqPayDataEncoded)
        .then(function() {
          res = true;
        })
        .fail(function() {
          res = false;
        })
        .fin(function() {
          res.should.be.equal(false);
          done();
        })
        .done();
    });

    it('should be able to return success when correct signature provided', function(done) {
      var billingService = BillingService.create();
      billingService.setLiqPayConfig(config.payment.liqPay);
      var liqPayDataEncoded = billingService.getLigPayServiceResponseData({
        amount:1,
        currency:'UAH',
        orderId:'1'
      });
      var res = null;
      billingService.checkLiqPayData(liqPayDataEncoded)
        .then(function() {
          res = true;
        })
        .fail(function() {
          res = false;
        })
        .fin(function() {
          res.should.be.equal(true);
          done();
        })
        .done();
    });

  });
});