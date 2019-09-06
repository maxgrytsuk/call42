'use strict';

/**
 * Module dependencies.
 */

var should = require('should'),
  ChannelAsteriskMock = require('../../app/tests/mocks/channel.asterisk.server.service.mock'),
  ChannelEmailMock = require('../../app/tests/mocks/channel.email.server.service.mock'),
  BillingServiceMock = require('../../app/tests/mocks/billing.server.service.mock'),
  BalanceServiceMock = require('../../app/tests/mocks/balance.server.service.mock'),
  UserServiceMock = require('../../app/tests/mocks/user.server.service.mock'),
  CheckerBalance = require('../../app/services/checker.balance.server.service');

/**
 * Globals
 */
var checkerBalance;

/**
 * Unit tests
 */

describe('CheckerBalance Unit Tests:', function() {
  beforeEach(function(done) {
    checkerBalance = CheckerBalance.create({
      channelSettings:{},
      callbackRequest:{},
      channel:{},
      user:{},
      notification:{}
    });
    done();
  });

  describe('Method Check', function() {

    it('should be able to return result with failure when there are no money and no free notifications - asterisk channel', function(done) {
      checkerBalance.setChannelSettings({
       type:'asterisk'
      });
      var asteriskChannelMock = ChannelAsteriskMock.create();
      checkerBalance.setChannel(asteriskChannelMock);

      var balanceService = BalanceServiceMock.create();
      balanceService.setBalance({results:[]});
      var billingService = BillingServiceMock.create();
      billingService.setBalanceService(balanceService);
      checkerBalance.setBalanceService(balanceService);
      checkerBalance.setBillingService(billingService);

      var userService = UserServiceMock.create();
      userService.user = {
        money:0,
        notifications:0
      };
      checkerBalance.setUserService(userService);
      var resultCode = null;
      checkerBalance.check()
        .fail(function(result){
          if (result) {
            resultCode = result.code;
          }
        })
        .fin(function() {
          (resultCode === null).should.be.equal(false);
          if (resultCode){
            resultCode.should.be.eql(checkerBalance.statuses.notEnoughMoney);
          }
          done();
        })
        .done();
    });

    it('should be able to return result with failure when there are no money and no free notifications - email channel', function(done) {
      checkerBalance.setChannelSettings({
        type:'email'
      });
      var emailChannelMock = ChannelEmailMock.create();

      checkerBalance.setChannel(emailChannelMock);
      var balanceService = BalanceServiceMock.create();
      balanceService.setBalance({results:[]});
      var billingService = BillingServiceMock.create();
      billingService.setBalanceService(balanceService);
      checkerBalance.setBillingService(billingService);
      checkerBalance.setBalanceService(balanceService);

      var userService = UserServiceMock.create();
      userService.user = {
        money:0,
        notifications:0
      };
      checkerBalance.setUserService(userService);
      var resultCode = null;
      checkerBalance.check()
        .fail(function(result){
          if (result) {
            resultCode = result.code;
          }
        })
        .fin(function() {
          (resultCode === null).should.be.equal(false);
          if (resultCode){
            resultCode.should.be.eql(checkerBalance.statuses.notEnoughMoney);
          }
          done();
        })
        .done();
    });

    it('should be able to return result with failure when there are no money and some free notifications - asterisk channel', function(done) {
      checkerBalance.setChannelSettings({
        type:'asterisk'
      });
      var asteriskChannelMock = ChannelAsteriskMock.create();
      checkerBalance.setChannel(asteriskChannelMock);

      var balanceService = BalanceServiceMock.create();
      balanceService.setBalance({results:[]});
      var billingService = BillingServiceMock.create();
      billingService.setBalanceService(balanceService);
      checkerBalance.setBillingService(billingService);
      checkerBalance.setBalanceService(balanceService);

      var userService = UserServiceMock.create();
      userService.user = {
        money:0,
        notifications:10
      };
      checkerBalance.setUserService(userService);
      var resultCode = null;
      checkerBalance.check()
        .fail(function(result){
          if (result) {
            resultCode = result.code;
          }
        })
        .fin(function() {
          (resultCode === null).should.be.equal(false);
          if (resultCode){
            resultCode.should.be.eql(checkerBalance.statuses.notEnoughMoney);
          }
          done();
        })
        .done();
    });

    it('should be able to create balance item when there are some money and no free notifications - email channel', function(done) {
      var testData = {money : 300};
      checkerBalance.setChannelSettings({
        type:'email'
      });
      var emailChannelMock = ChannelEmailMock.create();
      checkerBalance.setChannel(emailChannelMock);
      var billingService = BillingServiceMock.create();

      var balanceService = BalanceServiceMock.create();
      balanceService.setBalance({results:[]});
      billingService.setBalanceService(balanceService);
      checkerBalance.setBillingService(billingService);
      checkerBalance.setBalanceService(balanceService);
      var userService = UserServiceMock.create();
      userService.user = {
        money:testData.money,
        notifications:0
      };
      checkerBalance.setUserService(userService);
      var resultCode = null;
      checkerBalance.check()
        .then(function(result){
          if (result) {
            resultCode = result.code;
          }
        })
        .fin(function() {
          (resultCode === null).should.be.equal(true);
          userService.user.money.should.be.equal(testData.money - billingService.prices.EMAIL);
          balanceService.balance.results[0].type.should.be.equal(balanceService.balanceTypes.moneyWithdrawal);
          var money = parseInt('-' + billingService.prices.EMAIL);
          balanceService.balance.results[0].money.should.be.equal(money);
          done();
        })
        .done();
    });

    it('should be able to return result with success when there are no money and some free notifications - email channel', function(done) {
      var notifications = 10;
      checkerBalance.setChannelSettings({
        type:'email'
      });
      var emailChannelMock = ChannelEmailMock.create();
      checkerBalance.setChannel(emailChannelMock);
      var billingService = BillingServiceMock.create();
      var balanceService = BalanceServiceMock.create();
      balanceService.setBalance({results:[]});
      billingService.setBalanceService(balanceService);
      checkerBalance.setBillingService(billingService);
      checkerBalance.setBalanceService(balanceService);
      var userService = UserServiceMock.create();
      userService.user = {
        money:0,
        notifications:notifications
      };
      checkerBalance.setUserService(userService);
      var resultCode = null;
      checkerBalance.check()
        .then(function(result){
          if (result) {
            resultCode = result.code;
          }
        })
        .fin(function() {
          (resultCode === null).should.be.equal(true);
          userService.user.notifications.should.be.equal(notifications - 1);
          balanceService.balance.results[0].type.should.be.equal(balanceService.balanceTypes.notificationsWithdrawal);
          balanceService.balance.results[0].free.should.be.equal(-1);
          done();
        })
        .done();
    });

    it('should be able to return result with success when there are some money - asterisk channel', function(done) {
      var money = 300;
      var userService = UserServiceMock.create();
      userService.user = {
        money:money,
        notifications:0
      };
      checkerBalance.setUserService(userService);
      checkerBalance.setChannelSettings({
        type:'asterisk'
      });
      var asteriskChannelMock = ChannelAsteriskMock.create();
      checkerBalance.setChannel(asteriskChannelMock);
        var billingService = BillingServiceMock.create();
        var balanceService = BalanceServiceMock.create();
        balanceService.setBalance({results:[]});
        billingService.setBalanceService(balanceService);
        checkerBalance.setBillingService(billingService);
        checkerBalance.setBalanceService(balanceService);

      var resultCode = null;
      checkerBalance.check()
        .then(function(result){
          if (result) {
            resultCode = result.code;
          }
        })
        .fin(function() {
          (resultCode === null).should.be.equal(true);
          userService.user.money.should.be.equal(money - billingService.prices.ASTERISK);
          userService.user.notifications.should.be.equal(0);
          done();
        })
        .done();
    });

  });

  describe('Method checkUserMaxNotificationsCount', function() {

    it('should be able to set max notifications if there are no accruals yet', function(done) {
      var currentNotificationsCount = 10;
      var maxNotificationsCount = 40;

      checkerBalance.setUser({
        notifications:currentNotificationsCount,
        notifications_max:maxNotificationsCount
      });
      var billingService = BillingServiceMock.create();
      var balanceService = BalanceServiceMock.create();
      balanceService.setBalance({results:[]});
      billingService.setBalanceService(balanceService);
      checkerBalance.setBillingService(billingService);
      checkerBalance.setBalanceService(balanceService);
      var userService = UserServiceMock.create();
      checkerBalance.setUserService(userService);

      checkerBalance.checkUserMaxNotificationsCount()
        .then(function(){
          checkerBalance.user.notifications.should.be.equal(maxNotificationsCount);
          balanceService.balance.results[0].type.should.be.equal(balanceService.balanceTypes.notificationsMonthlyAccrual);
          balanceService.balance.results[0].notifications.should.be.equal(maxNotificationsCount - currentNotificationsCount);
        })
        .fin(function(){
          done();
        })
        .done();
    });

    it('should be able to set max notifications at the beginning ot the month', function(done) {
      var currentNotificationsCount = 10;
      var maxNotificationsCount = 40;
      checkerBalance.setUser({
        notifications:currentNotificationsCount,
        notifications_max:maxNotificationsCount
      });

      var billingService = BillingServiceMock.create();
      var now = new Date();
      var dayMonthBefore = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
      var balanceService = BalanceServiceMock.create();
      balanceService.setBalance({results:[]});
      billingService.setBalanceService(balanceService);
      checkerBalance.setBillingService(billingService);
      checkerBalance.setBalanceService(balanceService);

      checkerBalance.setUserService(UserServiceMock.create());

      checkerBalance.checkUserMaxNotificationsCount()
        .then(function() {
          balanceService.balance.results[0].type.should.be.equal(balanceService.balanceTypes.notificationsMonthlyAccrual);
          balanceService.balance.results[0].free.should.be.equal(maxNotificationsCount - currentNotificationsCount);
          done();
        })
        .done();
    });

  });
});