'use strict';

/**
 * Module dependencies.
 */

var should = require('should'),
  CheckerEnabled = require('../../app/services/checker.enabled.server.service');

/**
 * Globals
 */
var checkerEnabled;

/**
 * Unit tests
 */

describe('CheckerEnabled Unit Tests:', function() {
  beforeEach(function(done) {
    checkerEnabled = CheckerEnabled.create({
      channelSettings:{},
      callbackRequest:{},
      channel:{},
      user:{}
    });
    done();
  });

  describe('Method Check', function() {

    it('should be able to return result with failure when channel is disabled', function(done) {
      checkerEnabled.setChannelSettings({isEnabled:false});
      var resultCode = null;
      checkerEnabled.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function() {
          (resultCode === null).should.be.equal(false);
          if (resultCode){
            resultCode.should.be.eql(CheckerEnabled.statuses.disabled);
          }
          done();
        })
        .done();
    });

    it('should be able to return result with success when channel is enabled', function(done) {
      checkerEnabled.setChannelSettings({isEnabled:true});
      var resultCode = null;
      checkerEnabled.check()
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