'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  Detector = require('../../app/services/detector.server.service');

/**
 * Globals
 */
var ip, phoneCodeData;

var detectCountryLib = {
  lookupCountry : function(ip) {
    var data = {'5.58.0.0':'UA', '2.60.0.0':'RU', '3.0.0.0':'US'};
    return data[ip];
  }
};

/**On
 * Unit tests
 */

describe('Detector Unit Tests:', function() {

  beforeEach(function(done) {
    Detector.setLibrary(detectCountryLib);
    done();
  });

  describe('Method Detect Phone Code', function() {

    it('should be able to return correct phone code depending on ip for different countries', function(done) {
      //source for ip addresses
      //http://www.programva.com/ru/ip-adresa-evropa-rosija-mir

      ip = '5.58.0.0';//Ukraine
      phoneCodeData = Detector.getPhoneCodeData(ip);
      (phoneCodeData === null).should.be.equal(false);

      Detector.extractPhoneCodePrefix(phoneCodeData.mask).should.be.equal('+380');

      ip = '2.60.0.0';//Russia
      phoneCodeData = Detector.getPhoneCodeData(ip);
      (phoneCodeData === null).should.be.equal(false);
      Detector.extractPhoneCodePrefix(phoneCodeData.mask).should.be.equal('+7');

      done();
    });

    it('should be able to return correct language depending on ip for different countries', function(done) {
      //source for ip addresses
      //http://www.programva.com/ru/ip-adresa-evropa-rosija-mir
      var lang;
      ip = '5.58.0.0';//Ukraine
      lang = Detector.detectLanguage(ip);
      (lang === null).should.be.equal(false);
      lang.should.be.equal('ru');

      ip = '2.60.0.0';//Russia
      lang = Detector.detectLanguage(ip);
      (lang === null).should.be.equal(false);
      lang.should.be.equal('ru');

      ip = '3.0.0.0';//USA
      lang = Detector.detectLanguage(ip);
      (lang === null).should.be.equal(false);
      lang.should.be.equal('en');

      done();
    });

  });

});