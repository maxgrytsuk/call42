'use strict';

/**
 * Module dependencies.
 */
//require('../../server');

var should = require('should'),
  CallbackRequestService = require('../../app/services/callbackRequest.server.service');

/**
 * Globals
 */


/**
 * Unit tests
 */
describe('CallbackRequestService Unit Tests:', function() {


  describe('Method Get Query', function() {

    it('should be able to return query with correct conditions', function(done) {
      var phone = '+3801111111';
      var req = {
        user: {id:'userId'},
        query:{
          phone: phone,
          widget:'{"id":"widgetId"}',
          period:'100',
          status:'success'
        }
      };
      var query = CallbackRequestService.getQuery(req.query, req.user);
      query._conditions.widget.should.be.eql('widgetId');
      query._conditions.user.should.be.eql('userId');
      should.exist(query._conditions.created.$gt);
      should.exist(query._conditions['data.phone']);
      done();
    });

  });

});