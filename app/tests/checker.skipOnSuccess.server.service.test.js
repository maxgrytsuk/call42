'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  CheckerSkipOnSuccess = require('../../app/services/checker.skipOnSuccess.server.service');

/**
 * Globals
 */
var checkerSkipOnSuccess;

/**
 * Unit tests
 */

describe('CheckerSkipOnSuccess Unit Tests:', function() {
  beforeEach(function(done) {
    checkerSkipOnSuccess = CheckerSkipOnSuccess.create({
      channelSettings:{},
      callbackRequest:{},
      channel:{},
      user:{}
    });
    done();
  });

  describe('Method Check', function() {

    it('should be able to return result with result code when skipOnSuccess flag is set to true and there was previous successful notification', function(done) {
      checkerSkipOnSuccess.setChannelSettings({
        skipOnSuccess:true
      });
      checkerSkipOnSuccess.setPrevNotifications([{success:false},{success:true}]);
      var resultCode = null;
      checkerSkipOnSuccess.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function() {
          (resultCode === null).should.be.equal(false);
          if (resultCode){
            resultCode.should.be.eql(checkerSkipOnSuccess.statuses.noSendIfsuccess);
          }
          done();
        })
        .done();
    });

    it('should be able to return result without result code when skipOnSuccess flag is set to false and there was previous successful notification', function(done) {
      checkerSkipOnSuccess.setChannelSettings({
        skipOnSuccess:false
      });
      checkerSkipOnSuccess.setPrevNotifications([{success:false},{success:true}]);
      var resultCode = null;
      checkerSkipOnSuccess.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function() {
          (resultCode === null).should.be.equal(true);
          done();
        })
        .done();
    });

    it('should be able to return result without result code when skipOnSuccess flag is set to true and there was no previous successful notification', function(done) {
      checkerSkipOnSuccess.setChannelSettings({
        skipOnSuccess:true
      });
      checkerSkipOnSuccess.setPrevNotifications([{success:false},{success:false}]);
      var resultCode = null;
      checkerSkipOnSuccess.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function() {
          (resultCode === null).should.be.equal(true);
          done();
        })
        .done();
    });

  });

});