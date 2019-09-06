'use strict';

/**
 * Module dependencies.
 */
//require('../../server');

var should = require('should'),
  SmtpMock = require('../../app/tests/mocks/smtp.mock'),
  ChannelEmail = require('../../app/services/channel.email.server.service');

/**
 * Globals
 */
var emailChannel,smtp;

/**
 * Unit tests
 */

describe('ChannelEmail Unit Tests:', function() {
  beforeEach(function(done) {
    emailChannel = ChannelEmail.create();
    emailChannel.user = {lang:'en'};
    smtp  = SmtpMock.create();
    emailChannel.getEmailService().setSmtpTransport(smtp);
    emailChannel.setData({phone:'+11111111111', referer:'http://test.com'});
    done();
  });

  describe('Method Send Mail', function() {

    it('should be able to return result with failure when send mail was unsuccessful', function(done) {
      smtp.setSendMailSuccess(false);
      emailChannel.notify({
        params:{
          emails:'test@test.com'
        },
        callbackRequest: {
          data:{
            referer:'http://test.com'
          }
        }
      })
        .fail(function(result){
          result.code.should.be.eql('STATUS_SEND_FAILURE');
          done();
        })
        .done();
    });

    it('should be able to return result with success when send mail was successful', function(done) {
      smtp.setSendMailSuccess(true);
      emailChannel.notify({
        params:{
          emails:'test@test.com'
        },
        callbackRequest: {
          data:{
            referer:'http://test.com'
          }
        }
      })
        .then(function(result) {
          result.code.should.be.eql('STATUS_SEND_SUCCESS');
          done();
        })
        .done();
    });


  });

});