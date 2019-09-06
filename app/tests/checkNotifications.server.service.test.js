'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  _ = require('lodash'),
  CheckNotificationsService = require('../services/checkNotifications.server.service'),
  BillingServiceMock = require('../../app/tests/mocks/billing.server.service.mock'),
  BalanceServiceMock = require('../../app/tests/mocks/balance.server.service.mock'),
  UserServiceMock = require('../../app/tests/mocks/user.server.service.mock')
  ;

/**
 * Unit tests
 */
describe('CheckNotificationsService Unit Tests:', function() {

  describe('Method Check', function() {

    it('should be able to create return accruals if notification was unsuccessful', function(done) {
      var billingService = BillingServiceMock.create();
      var balanceService = BalanceServiceMock.create();

      var notificationPrice = 20;
      balanceService.balance = {results:[
        {
          notification: 1,
          'money' : 0,
          'free' : 1
        },
        {
          notification: 2,
          'money' : notificationPrice,
          'free' : 0
        }
      ]};

      billingService.setBalanceService(balanceService);
      CheckNotificationsService.setBillingService(billingService);
      CheckNotificationsService.setBalanceService(balanceService);

      var userService = UserServiceMock.create();
      CheckNotificationsService.setUserService(userService);
      var moneyCurrent= 300;
      var notificationsCurrent= 20;
      var user = {
        notifications:notificationsCurrent,
        money:moneyCurrent
      };

      CheckNotificationsService.check({
        user:user,
        notifications:[
          {
            id: 1,
            'success' : false
          },
          {
            id: 2,
            'success' : false
          }
        ]
      })
        .then(function() {

          var updatedNotificationsCurrent = notificationsCurrent + 1;
          var updatedMoneyCurrent = moneyCurrent + notificationPrice;
          userService.user.notifications.should.be.equal(updatedNotificationsCurrent);
          userService.user.money.should.be.equal(updatedMoneyCurrent);

          balanceService.balance.results[2].type.should.be.equal(balanceService.balanceTypes.notificationsReturnAccrual);
          balanceService.balance.results[2].free.should.be.equal(1);
          balanceService.balance.results[2].freeCurrent.should.be.equal(updatedNotificationsCurrent);

          balanceService.balance.results[3].type.should.be.equal(balanceService.balanceTypes.moneyReturnAccrual);
          balanceService.balance.results[3].money.should.be.equal(notificationPrice);
          balanceService.balance.results[3].moneyCurrent.should.be.equal(updatedMoneyCurrent);
          done();
        })
        .done();
    });

  });
});