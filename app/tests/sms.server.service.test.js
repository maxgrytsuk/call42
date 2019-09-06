'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  SmsService = require('../services/sms.server.service'),
  SmsSmscentreServiceMock = require('../../app/tests/mocks/sms.smscentre.server.service.mock'),
  SmsPlivoServiceMock = require('../../app/tests/mocks/sms.plivo.server.service.mock')
  ;


describe('SmsService Unit Tests:', function() {

  describe('Method detectAdvantageousService', function() {

    it('should be able to return correctly chosen service', function(done) {

      SmsService.services = {
        smscentre: SmsSmscentreServiceMock,
        plivo: SmsPlivoServiceMock
      };

      SmsService.detectAdvantageousService({
        phone:'380501111111',
        user: {
          currency:{name:'UAH'}
        },
        smscentre: {
          cost:24,
          currency:'UAH'
        },
        plivo: {
          cost:20,
          currency:'UAH'
        }
      }).then(function(service) {
        service.name.should.be.equal('plivo');
        service.cost.should.be.equal(20);
        done();
      }).done();
    });

  });

});