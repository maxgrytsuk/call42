'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  UrlService = require('../../app/services/url.server.service');


/**
 * Unit tests
 */

describe('CheckUrlService Unit Tests:', function() {

  describe('Method Check', function() {

    it('should be able to return true when widget urls string contains origin url', function(done) {

      var result = UrlService.checkUrl({
        originUrl:'http://test1.com',
        urlsToCheck:'http://foo.bar, http://test1.com'
      });
      result.should.be.equal(true);
      done();

    });

    it('should be able to return true when widget urls string contains origin url with www', function(done) {

      var result = UrlService.checkUrl({
        originUrl:'http://www.test1.com',
        urlsToCheck:'http://foo.bar, http://test1.com'
      });
      result.should.be.equal(true);
      done();

    });

    it('should be able to return true when widget urls string has www part and contains origin url ', function(done) {

      var result = UrlService.checkUrl({
        originUrl:'http://test1.com',
        urlsToCheck:'http://foo.bar, http://www.test1.com'
      });
      result.should.be.equal(true);
      done();

    });

    it('should be able to return true when widget urls string has www part and contains origin url with www', function(done) {

      var result = UrlService.checkUrl({
        originUrl:'http://test1.com',
        urlsToCheck:'http://foo.bar, http://www.test1.com'
      });
      result.should.be.equal(true);
      done();

    });

    it('should be able to return false when widget urls string does not contain origin url', function(done) {

      var result = UrlService.checkUrl({
        originUrl:'http://test1.com',
        urlsToCheck:'http://foo.bar, http://test2.com'
      });
      result.should.be.equal(false);
      done();

    });

  });

});