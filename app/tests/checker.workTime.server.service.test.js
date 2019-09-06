'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  CheckerWorkTime = require('../../app/services/checker.workTime.server.service');

/**
 * Globals
 */
var checkerWorkTime;

/**
 * Unit tests
 */

describe('CheckerWorkTime Unit Tests:', function() {
  beforeEach(function(done) {
    checkerWorkTime = CheckerWorkTime.create({
      channelSettings:{},
      callbackRequest:{},
      channel:{},
      user:{}
    });
    done();
  });

  describe('Method Check', function() {

    it('should be able to return result with failure when there is day off', function(done) {
      checkerWorkTime.setChannelSettings({
        workTime: {mo:true,tu:true,we:true,th:true,fr:true,sa:false,su:false}
      });
      checkerWorkTime.setUser({
        timezone:'Europe/Kiev'
      });
      checkerWorkTime.setDateNow('2015-04-25T07:39:30.065Z');//saturday
      var resultCode = null;
      checkerWorkTime.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function() {
          (resultCode === null).should.be.equal(false);
          if (resultCode) {
            resultCode.should.be.eql(checkerWorkTime.statuses.beyondWorkTime);
          }
          done();
        })
        .done();
    });

    it('should be able to return result with failure when current time beyond limits', function(done) {
      var dateFrom = {hours:8,minutes:0};
      var dateTo = {hours:18,minutes:30};
      checkerWorkTime.setChannelSettings({
        workTime: [
          {idx:1,day:'mo',available:true, from:dateFrom, to:dateTo},
          {idx:2,day:'tu',available:true, from:dateFrom, to:dateTo},
          {idx:3,day:'we',available:true, from:dateFrom, to:dateTo},
          {idx:4,day:'th',available:true, from:dateFrom, to:dateTo},
          {idx:5,day:'fr',available:true, from:dateFrom, to:dateTo},
          {idx:6,day:'sa',available:true, from:dateFrom, to:dateTo},
          {idx:7,day:'su',available:true, from:dateFrom, to:dateTo}
        ]
      });
      /*

      * */
      checkerWorkTime.setUser({
        timezone:'Europe/Kiev'
      });
      checkerWorkTime.setDateNow('2015-04-24T00:39:30.065Z');//friday 0:39 (3:39 +3 (Kiev))
      var resultCode = null;
      checkerWorkTime.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function() {
          (resultCode === null).should.be.equal(false);
          if (resultCode) {
            resultCode.should.be.eql(checkerWorkTime.statuses.beyondWorkTime);
          }
          done();
        })
        .done();
    });

    it('should be able to return result with success when current time is in limits', function(done) {
      var dateFrom = {hours:8,minutes:0};
      var dateTo = {hours:18,minutes:30};
      checkerWorkTime.setChannelSettings({
        workTime: [
          {idx:1,day:'mo',available:true, from:dateFrom, to:dateTo},
          {idx:2,day:'tu',available:true, from:dateFrom, to:dateTo},
          {idx:3,day:'we',available:true, from:dateFrom, to:dateTo},
          {idx:4,day:'th',available:true, from:dateFrom, to:dateTo},
          {idx:5,day:'fr',available:true, from:dateFrom, to:dateTo},
          {idx:6,day:'sa',available:false, from:dateFrom, to:dateTo},
          {idx:7,day:'su',available:false, from:dateFrom, to:dateTo}
        ]
      });
      checkerWorkTime.setUser({
        timezone:'Europe/Kiev'
      });
      checkerWorkTime.setDateNow('2015-04-24T09:39:30.065Z');//friday 0:39 (3:39 +3 (Kiev))
      checkerWorkTime.check();
      var resultCode = null;
      checkerWorkTime.check()
        .fail(function(result){
          resultCode = result.code;
        })
        .fin(function() {
          (resultCode === null).should.be.equal(true);
          done();
        })
        .done();
    });

    it('should be able to return result with success when there are no limits for working day', function(done) {
      var dateFrom = {hours:0,minutes:0};
      var dateTo = {hours:24,minutes:0};
      checkerWorkTime.setChannelSettings({
        workTime:  [
          {idx:1,day:'mo',available:true, from:dateFrom, to:dateTo},
          {idx:2,day:'tu',available:true, from:dateFrom, to:dateTo},
          {idx:3,day:'we',available:true, from:dateFrom, to:dateTo},
          {idx:4,day:'th',available:true, from:dateFrom, to:dateTo},
          {idx:5,day:'fr',available:true, from:dateFrom, to:dateTo},
          {idx:6,day:'sa',available:false, from:dateFrom, to:dateTo},
          {idx:7,day:'su',available:false, from:dateFrom, to:dateTo}
        ]
      });
      checkerWorkTime.setUser({
        timezone:'Europe/Kiev'
      });
      checkerWorkTime.setDateNow('2015-04-24T00:39:30.065Z');//friday 0:39 (3:39 +3 (Kiev))
      var resultCode = null;
      checkerWorkTime.check()
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