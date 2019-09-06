'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  ChannelAsteriskMock = require('../../app/tests/mocks/channel.asterisk.server.service.mock'),
  AsteriskServiceMock = require('../../app/tests/mocks/asterisk.server.service.mock'),
  ChannelEmailMock = require('../../app/tests/mocks/channel.email.server.service.mock'),
  CheckerOnline = require('../../app/services/checker.online.server.service');

/**
 * Globals
 */
var checkerOnline, emailChannelMock;

/**
 * Unit tests
 */

describe('CheckerOnline Unit Tests:', function() {
  beforeEach(function(done) {
    checkerOnline = CheckerOnline.create({
      channelSettings:{},
      callbackRequest:{},
      channel:{},
      user:{}
    });

    emailChannelMock = ChannelEmailMock.create();
    done();
  });

  describe('Method Check', function() {

    it('should be able to return result with failure when channel is offline and sendIfOffline flag is set to false', function(done) {
      checkerOnline.setChannelSettings({
          sendIfOffline: false,
          nativeParams:{}
      });
      var asteriskChannelMock = ChannelAsteriskMock.create();
      var asteriskService = AsteriskServiceMock.create({
        params:{},
        user: {}
      });
      asteriskService.setIsOnline(false);
      asteriskChannelMock.setAsteriskService(asteriskService);
      checkerOnline.setChannel(asteriskChannelMock);
      var resultCode = null;
      checkerOnline.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function() {
          (resultCode === null).should.be.equal(false);
          if (resultCode){
            resultCode.should.be.eql(checkerOnline.statuses.noActivePeers);
          }
          done();
        })
        .done();
    });

    it('should be able to return result with success when channel is offline and sendIfOffline flag is set to true', function(done) {
      checkerOnline.setChannelSettings({
        sendIfOffline: true,
        nativeParams:{}
      });
      var asteriskChannelMock = ChannelAsteriskMock.create();
      var asteriskService = AsteriskServiceMock.create({
        params:{},
        user: {}
      });
      asteriskService.setIsOnline(false);
      asteriskChannelMock.setAsteriskService(asteriskService);
      checkerOnline.setChannel(asteriskChannelMock);
      var resultCode = null;
      checkerOnline.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function() {
          (resultCode === null).should.be.equal(true);
          done();
        })
        .done();
    });

    it('should be able to return result with success when channel is online and sendIfOffline flag is set to false', function(done) {
      checkerOnline.setChannelSettings({
        sendIfOffline: false,
        nativeParams:{}
      });
      var asteriskChannelMock = ChannelAsteriskMock.create();
      var asteriskService = AsteriskServiceMock.create({
        params:{},
        user: {}
      });
      asteriskService.setIsOnline(true);
      asteriskChannelMock.setAsteriskService(asteriskService);
      checkerOnline.setChannel(asteriskChannelMock);
      var resultCode = null;
      checkerOnline.check()
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