'use strict';

/**
 * Module dependencies.
 */
var config = require('../../config/config'),
  path = require('path');
// Globbing model files
config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
  require(path.resolve(modelPath));
});

var should = require('should'),
  Q = require('q'),
  AsteriskService = require('../../app/services/asterisk.server.service'),
  AsteriskManagerMock = require('../../app/tests/mocks/asterisk.manager.mock')
  ;

/**
 * Globals
 */
var asteriskService, phone = '+380500000000';
var asteriskParams;

/**
 * Unit tests
 */
describe('AsteriskService Unit Tests:', function() {

  beforeEach(function(done) {
    asteriskParams= {
      'host' : 'voip.algo-rithm.com',
      'port' : 12178,
      'user' : 'user',
      'secret' : 'secret',
      method1Params:{
        'peer' : '104',
        'context' : 'local'
      },
      method2Params:{
        'destination' : 'ivr-test, 900, 1',
        'checkActivePeers' : '105,106',
        'routes' : [
          { 'prefix' : '+38', pattern:'0', 'channel' : 'SIP/GSM-UKR' },
          { 'prefix' : '', pattern:'+7', 'channel' : 'SIP/MAGIC' }
        ]
      }
    };
    asteriskService = AsteriskService.create({
      params:asteriskParams,
      user: {}
    });
    asteriskService.setAsteriskManagerService(AsteriskManagerMock);
    asteriskService.connect();
    asteriskService.ami.setCalleridnum(phone);
    done();
  });

  describe('Method getPeersToCheck', function() {

    it('should be able to return correct peers names to check if they are online', function(done) {
      asteriskService.params.callMethod = '1';

      var peers = asteriskService.getPeersToCheck(asteriskParams);
      peers.length.should.be.equal(1);
      peers[0].should.be.equal('104');

      asteriskService.params.callMethod = '2';
      var peers = asteriskService.getPeersToCheck(asteriskParams);
      peers.length.should.be.equal(2);
      peers[0].should.be.equal('105');
      peers[1].should.be.equal('106');
      done();

    });

  });

  describe('Method getOriginateParams', function() {

    it('should be able to resolve correct originate params for callMethod1', function(done) {
      asteriskService.params.callMethod = '1';
      asteriskService.getOriginateParams({phone:phone})
        .then(function(originateParams) {
          originateParams.channel.should.be.equal('SIP/' + asteriskParams.method1Params.peer);
          originateParams.context.should.be.equal(asteriskParams.method1Params.context);
          originateParams.exten.should.be.equal(phone);
          done();
        })
        .done();
    });

    it('should be able to resolve correct originate params for callMethod2', function(done) {
      asteriskService.params.callMethod = '2';
      asteriskService.getOriginateParams({phone:phone})
        .then(function(originateParams) {
          originateParams.channel.should.be.equal('SIP/GSM-UKR/0500000000');
          originateParams.context.should.be.equal('ivr-test');
          originateParams.exten.should.be.equal('900');
          originateParams.priority.should.be.equal('1');
          done();
        })
        .done();
    });

    it('should be able to reject with correct message when there are no routes for phone number for callMethod2', function(done) {
      asteriskService.params.callMethod = '2';
      asteriskService.getOriginateParams({phone:'+1901111111111'})
        .fail(function(message) {
          message.code.should.be.equal('STATUS_NO_ROUTE');
          done();
        })
        .done();
    });

    it('should be able to reject with correct message when incorrect params are provided for callMethod2', function(done) {
      asteriskService.params.callMethod = '2';
      asteriskService.params.method2Params.destination = 'ivr,900';//incorrect number of params divided by comma
      asteriskService.getOriginateParams({phone:phone})
        .fail(function(message) {
          message.code.should.be.equal('STATUS_WRONG_PARAMS');
          done();
        })
        .done();
    });

  });

  describe('Method isOnline', function() {

    it('should be able to return true when there are active users, callMethod 1', function(done) {

      asteriskService.params.callMethod = '1';
      asteriskService.ami.setActivePeers(['101','104']);
      asteriskService.isOnline()
        .then(function(data) {
          data.online.should.be.equal(true);
          done();
        })
        .done();
    });


    it('should be able to return false when there are no active users, callMethod 1', function(done) {

      asteriskService.params.callMethod = '1';
      asteriskService.ami.setActivePeers(['101','109']);
      asteriskService.isOnline()
        .then(function(data) {
          data.online.should.be.equal(false);
          done();
        })
        .done();
    });

    it('should be able to return true when there are active users, callMethod 2', function(done) {

      asteriskService.params.callMethod = '2';
      asteriskService.params.method2Params.checkActivePeers = '102, 104';
      asteriskService.ami.setActivePeers(['101','104']);
      asteriskService.isOnline()
        .then(function(data) {
          data.online.should.be.equal(true);
          done();
        })
        .done();
    });


    it('should be able to return false when there are no active users, callMethod 2', function(done) {

      asteriskService.params.callMethod = '2';
      asteriskService.ami.setActivePeers(['101','109']);
      asteriskService.isOnline()
        .then(function(data) {
          data.online.should.be.equal(false);
          done();
        })
        .done();
    });

  });

  describe('Method Originate', function() {

    it('should be able to return result with correct failure code when call was rejected by client - callMethod1', function(done) {
      asteriskService.params.callMethod = '1';
      asteriskService.ami.setCallResult(false);
      asteriskService.ami.setHangupCauseCode('17');
      asteriskService.ami.setCallFailureReason(null);

      asteriskService.originate({data:{phone: phone, guid: '0'}})
        .fail(function(data) {
          data.code.should.be.equal('STATUS_CALL_REJECTED_BY_CLIENT');
          done();
        })
        .done();
    });

    it('should be able to return result with correct failure code when call was rejected by client - callMethod2', function(done) {
      asteriskService.params.callMethod = '2';

      asteriskService.ami.setCallResult(false);
      asteriskService.ami.setCallFailureReason('5');

      asteriskService.originate({data:{phone: phone, guid: '0'}})
        .fail(function(data) {
          data.code.should.be.equal('STATUS_CALL_REJECTED_BY_CLIENT');
          done();
        })
        .done();
    });

    it('should be able to return result with correct failure code when call was not answered by peer - callMethod1', function(done) {
      asteriskService.params.callMethod = '1';

      asteriskService.ami.setCallResult(false);
      asteriskService.ami.setCallFailureReason('3');

      asteriskService.originate({data:{phone: phone, guid: '0'}})
        .fail(function(data) {
          data.code.should.be.equal('STATUS_CALL_NOT_ANSWERED_BY_PEER');
          done();
        })
        .done();
    });

    it('should be able to return result with correct failure code when call was not answered by peer - callMethod2', function(done) {
      asteriskService.params.callMethod = '2';
      asteriskService.ami.setHangupCauseCode('17');
      asteriskService.ami.setCallFailureReason(null);

      asteriskService.originate({data:{phone: phone, guid: '0'}})
        .fail(function(data) {
          data.code.should.be.equal('STATUS_CALL_NOT_ANSWERED_BY_PEER');
          done();
        })
        .done();
    });

    it('should be able to return result with correct failure code when call was rejected by peer - callMethod1', function(done) {
      asteriskService.params.callMethod = '1';

      asteriskService.ami.setCallResult(false);
      asteriskService.ami.setCallFailureReason('5');

      asteriskService.originate({data:{phone: phone, guid: '0'}})
        .fail(function(data) {
          data.code.should.be.equal('STATUS_CALL_REJECTED_BY_PEER');
          done();
        })
        .done();
    });

    it('should be able to return result with correct failure code when call was rejected by peer - callMethod2', function(done) {
      asteriskService.params.callMethod = '2';
      asteriskService.ami.setHangupCauseCode('21');
      asteriskService.ami.setCallFailureReason(null);

      asteriskService.originate({data:{phone: phone, guid: '0'}})
        .fail(function(data) {
          data.code.should.be.equal('STATUS_CALL_REJECTED_BY_PEER');
          done();
        })
        .done();
    });

    it('should be able to return result with correct failure code when call was failed', function(done) {
      asteriskService.ami.setHangupCauseCode('any');
      asteriskService.params.callMethod = '1';

      asteriskService.originate({data:{phone: phone, guid: '0'}})
        .fail(function(data) {
          data.code.should.be.equal('STATUS_ORIGINATE_FAILURE');
          done();
        })
        .done();
    });

    it('should be able to return result with success code when originate success', function(done) {
      this.timeout(5000);//default timeout should be increased for originate action
      asteriskService.ami.setHangupCauseCode('16');
      asteriskService.ami.setCallFailureReason(null);
      asteriskService.params.callMethod = '1';

      asteriskService.originate({data:{phone: phone, guid: '0'}})
        .then(function(data) {
          data.code.should.be.equal('STATUS_ORIGINATE_SUCCESS');
          done();
        })
        .done();
    });

  });

});