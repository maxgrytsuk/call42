'use strict';

/**
 * Module dependencies.
 */

var should = require('should'),
  _ = require('lodash'),
  CallbackManager = require('../../app/services/callbackManager.server.service'),
  CheckerEnabled = require('../../app/services/checker.enabled.server.service'),
  CheckerBalance = require('../../app/services/checker.balance.server.service'),
  BillingServiceMock = require('../../app/tests/mocks/billing.server.service.mock'),
  BalanceServiceMock = require('../../app/tests/mocks/balance.server.service.mock'),
  UserServiceMock = require('../../app/tests/mocks/user.server.service.mock'),
  ChannelAsteriskMock = require('../../app/tests/mocks/channel.asterisk.server.service.mock'),
  AsteriskServiceMock = require('../../app/tests/mocks/asterisk.server.service.mock'),
  ChannelEmailMock = require('../../app/tests/mocks/channel.email.server.service.mock'),
  NotificationServiceMock = require('../../app/tests/mocks/notification.server.service.mock'),
  CheckNotificationsServiceMock = require('../../app/tests/mocks/checkNotifications.server.service.mock'),
  CallbackRequestServiceMock = require('../../app/tests/mocks/callbackRequest.server.service.mock')
  ;

/**
 * Globals
 */
var callbackManager;
var dateFrom = {hours:0,minutes:0};
var dateTo = {hours:24,minutes:0};
var emailChannelSettings = {
  type: 'email',
  name: 'email',
  idWidget: 1,
  isEnabled: true,
  sendIfOffline: null,
  skipOnSuccess: false,//pass is sent before
  workTime: [
    {idx:1,day:'mo',available:true, from:dateFrom, to:dateTo},
    {idx:2,day:'tu',available:true, from:dateFrom, to:dateTo},
    {idx:3,day:'we',available:true, from:dateFrom, to:dateTo},
    {idx:4,day:'th',available:true, from:dateFrom, to:dateTo},
    {idx:5,day:'fr',available:true, from:dateFrom, to:dateTo},
    {idx:6,day:'sa',available:true, from:dateFrom, to:dateTo},
    {idx:7,day:'su',available:true, from:dateFrom, to:dateTo}
  ],
  nativeParams:{
    'emails' : '111@algo-rithm.com, 222@gmail.com'
  },
  checkers:[CheckerEnabled]
};
var asteriskChannelSettings =  {
  type: 'asterisk',
  name: 'asterisk',
  idWidget: 1,
  isEnabled: true,
  sendIfOffline: false,
  skipOnSuccess: false,//skip if sent before
  workTime: [
    {idx:1,day:'mo',available:true, from:dateFrom, to:dateTo},
    {idx:2,day:'tu',available:true, from:dateFrom, to:dateTo},
    {idx:3,day:'we',available:true, from:dateFrom, to:dateTo},
    {idx:4,day:'th',available:true, from:dateFrom, to:dateTo},
    {idx:5,day:'fr',available:true, from:dateFrom, to:dateTo},
    {idx:6,day:'sa',available:true, from:dateFrom, to:dateTo},
    {idx:7,day:'su',available:true, from:dateFrom, to:dateTo}
  ],
  nativeParams:{
    'host' : 'voip.algo-rithm.com',
    'port' : 12178,
    'user' : 'user',
    'secret' : 'secret',
    'enabled' : true,
    'callMethod':'2',
    'method1Params':{
      peer:'',
      context:''
    },
    method2params:{
      'destination' : 'ivr-test, 900, 1',
      'checkActivePeers' : '103, 104',
      'routes' : [
        { 'phonePrefix' : '+380', 'channel' : 'SIP/GSM-UKR' },
        { 'phonePrefix' : '+7', 'channel' : 'SIP/MAGIC' }
      ]
    }
  },
  checkers:[CheckerEnabled]
};
var moneyCurrent= 300;
var notificationsCurrent= 20;
var widget = {
  '_id' : 1,
  'name' : 'test',
  'url' : 'http://local.com',
  'user' : {
    timezone:'GMT',
    money:moneyCurrent,
    notifications:notificationsCurrent
  },
  'public' : {
    'texts' : { },
    'selectors' : '',
    'activate_page_limit_time' : 3,
    'activate_page_limit' : 3,
    'activate_time' : 10
  },
  'created' : '2015-02-10T14:22:25.969Z',
  'channels':[
    {
      model:emailChannelSettings,
      idx:1
    }
    , {
      model:asteriskChannelSettings,
      idx:1
    }
  ]
};

/**
 * Unit tests
 */
describe('CallbackManager Unit Tests:', function() {
  beforeEach(function(done) {
    callbackManager = CallbackManager.create({
      widget:widget,
      callbackRequest:{
        data:{
          phone:'+11111111111',
          widgetServerHost:'http://call42.com'
        },
        results:[],
        save:function(callback) {
          callback();
        }
      }
    });
    done();
  });

  describe('Method ProcessRequest', function() {

    it('should be able to withdraw correct number of free notifications and correct sum of money', function(done) {

      var moneyCurrent= 300;
      var notificationsCurrent= 20;

      var emailChannelSettings1 = {
        type: 'email',
        nativeParams:{
          'emails' : '1@1.com'
        },
        checkers:['CheckerBalance']
      };
      var emailChannelSettings2 = {
        type: 'email',
        nativeParams:{
          'emails' : '2@2.com'
        },
        checkers:['CheckerBalance']
      };
      var asteriskChannelSettings1 =  {
        type: 'asterisk',
        nativeParams:{
          'host' : 'voip1.algo-rithm.com'
        },
        checkers:['CheckerBalance']
      };
      var asteriskChannelSettings2 =  {
        type: 'asterisk',
        nativeParams:{
          'host' : 'voip2.algo-rithm.com'
        },
        checkers:['CheckerBalance']
      };

      var widget = {
        user:{},
        channels:[
          {
            model:emailChannelSettings1,
            idx:1
          },
          {
            model:emailChannelSettings2,
            idx:2
          },
          {
            model:asteriskChannelSettings1,
            idx:3
          },
          {
            model:asteriskChannelSettings2,
            idx:4
          }
        ]
      };

      var callbackManager = CallbackManager.create({
        widget:widget,
        callbackRequest:{
          data:{
            widgetServerHost:'http://cal42.com'
          },
          save:function(callback) {
            callback();
          }
        }
      });

      var userService = UserServiceMock.create();
      userService.user = {
        money:moneyCurrent,
        notifications:notificationsCurrent
      };
      callbackManager.setUserService(userService);
      CheckerBalance.setUserService(userService);

      var billingService = BillingServiceMock.create();
      var balanceService = BalanceServiceMock.create();

      balanceService.setBalance({results:[]});
      billingService.setBalanceService(balanceService);
      callbackManager.setBillingService(billingService);
      callbackManager.setBalanceService(balanceService);
      CheckerBalance.setBillingService(billingService);
      CheckerBalance.setBalanceService(balanceService);

      callbackManager.setChannel({type:'asterisk', value:ChannelAsteriskMock.create()});
      callbackManager.setChannel({type:'email', value:ChannelEmailMock.create()});

      var notificationService = NotificationServiceMock.create();
      var callbackRequestService = CallbackRequestServiceMock.create();

      callbackManager.setNotificationService(notificationService);
      callbackManager.setCheckNotificationsService(CheckNotificationsServiceMock);
      callbackManager.setCallbackRequestService(callbackRequestService);

      callbackManager.processRequest()
        .then(function() {
          userService.user.notifications.should.be.equal(notificationsCurrent - 2);
          userService.user.money.should.be.equal(moneyCurrent - 2 * billingService.prices.ASTERISK);

          balanceService.balance.results[0].free.should.be.equal(-1);
          balanceService.balance.results[0].type.should.be.equal(balanceService.balanceTypes.notificationsWithdrawal);
          balanceService.balance.results[1].free.should.be.equal(-1);
          balanceService.balance.results[1].type.should.be.equal(balanceService.balanceTypes.notificationsWithdrawal);

          var money = parseInt('-' + billingService.prices.ASTERISK);
          balanceService.balance.results[2].money.should.be.equal(money);
          balanceService.balance.results[2].type.should.be.equal(balanceService.balanceTypes.moneyWithdrawal);
          balanceService.balance.results[3].money.should.be.equal(money);
          balanceService.balance.results[3].type.should.be.equal(balanceService.balanceTypes.moneyWithdrawal);
          done();
        })
        .done();
    });
  });

  describe('Method CheckIsAnyChannelOnline', function() {

    it('should be able to return false when channels are disabled', function(done) {

      widget.channels[0].model.isEnabled = false;
      widget.channels[1].model.isEnabled = false;
      var asteriskChannelMock = ChannelAsteriskMock.create();
      var emailChannelMock = ChannelEmailMock.create();

      callbackManager.setChannel({type:'asterisk', value:asteriskChannelMock});
      callbackManager.setChannel({type:'email', value:emailChannelMock});

      callbackManager.isAnyChannelOnline()
        .then(function(result) {
          result.should.be.eql(false);
          done();
        })
        .done();
    });

    it('should be able to return true when channels are enabled and one of the channels is online', function(done) {

      widget.channels[0].model.isEnabled = true;
      widget.channels[1].model.isEnabled = true;
      var asteriskChannelMock = ChannelAsteriskMock.create();
      var asteriskService = AsteriskServiceMock.create({
        params:{},
        user: {}
      });
      asteriskService.setIsOnline(true);
      asteriskChannelMock.setAsteriskService(asteriskService);
      var emailChannelMock = ChannelEmailMock.create();

      callbackManager.setChannel({type:'asterisk', value:asteriskChannelMock});
      callbackManager.setChannel({type:'email', value:emailChannelMock});

      callbackManager.isAnyChannelOnline()
        .then(function(result) {
          result.should.be.eql(true);
        })
        .fin(function() {
          done();
        })
        .done();
    });

    it('should be able to return false when channels are enabled and all channels are offline', function(done) {

      widget.channels[0].model.isEnabled = true;
      widget.channels[1].model.isEnabled = true;
      var asteriskChannelMock = ChannelAsteriskMock.create();
      var asteriskService = AsteriskServiceMock.create({
        params:{},
        user: {}
      });
      asteriskService.setIsOnline(false);
      asteriskChannelMock.setAsteriskService(asteriskService);
      var emailChannelMock = ChannelEmailMock.create();

      callbackManager.setChannel({type:'asterisk', value:asteriskChannelMock});
      callbackManager.setChannel({type:'email', value:emailChannelMock});

      callbackManager.isAnyChannelOnline()
        .then(function(result) {
          result.should.be.eql(false);
        })
        .fin(function() {
          done();
        })
        .done();
    });

  });

  describe('Method CreateChannel', function() {

    it('should be able to return asterisk channel object', function(done) {

      callbackManager.setChannelClasses({
        email:ChannelEmailMock,
        asterisk:ChannelAsteriskMock
      });

      var asteriskService = AsteriskServiceMock.create({
        params: asteriskChannelSettings,
        data: null,
        user: {}
      });
      callbackManager.setAsteriskService(asteriskService);

      callbackManager.createChannel({
        channelSettings:asteriskChannelSettings,
        callbackRequest:{}
      }).then(function(channel) {
        channel.should.have.property('asteriskService');
        channel.should.have.property('data');
        done();
      })
        .done();
    });

    it('should be able to return email channel object', function(done) {

      callbackManager.setChannelClasses({
        email:ChannelEmailMock,
        asterisk:ChannelAsteriskMock
      });

      callbackManager.createChannel({
        channelSettings:emailChannelSettings,
        callbackRequest:{}
      }).then(function(channel) {
        channel.should.have.property('data');
        done();
      })
        .done();
    });

  });

});