'use strict';

/**
 * Module dependencies.
 */

var should = require('should'),
  CheckerExcludedPrefixes = require('../../app/services/checker.excludedPrefixes.server.service');

/**
 * Globals
 */
var checkerExcludedPrefixes;

describe('CheckerExcludedPrefixes Unit Tests:', function() {
  beforeEach(function(done) {
    checkerExcludedPrefixes = CheckerExcludedPrefixes.create({
      channelSettings:{},
      callbackRequest:{},
      channel:{},
      user:{}
    });
    done();
  });

  describe('Method Check', function() {

    it('should be able to return result with failure when phone number has excluded prefix', function(done) {
      checkerExcludedPrefixes.setChannelSettings({
        nativeParams:{
          method2Params:{
            excludedPrefixes:'+7480   +7490'
          }
        }
      });
      checkerExcludedPrefixes.setCallbackRequest({
        data:{phone:'+749011111111'}
      });
      var resultCode = null;
      checkerExcludedPrefixes.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function(){
          (resultCode === null).should.be.equal(false);
          if (resultCode) {
            resultCode.should.be.eql(checkerExcludedPrefixes.statuses.excludedPrefix);
          }
          done();
        })
        .done();
    });

    it('should be able to return result with success when phone number does not have excluded prefix', function(done) {
      checkerExcludedPrefixes.setChannelSettings({
        nativeParams:{
          excludedPrefixes:'+7480   +7491'
        }
      });
      checkerExcludedPrefixes.setCallbackRequest({
        data:{phone:'+749011111111'}
      });
      var resultCode = null;
      checkerExcludedPrefixes.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function(){
          (resultCode === null).should.be.equal(true);
          if (resultCode) {
            resultCode.should.be.eql(checkerExcludedPrefixes.statuses.excludedPrefix);
          }
          done();
        })
        .done();
    });

  });

});