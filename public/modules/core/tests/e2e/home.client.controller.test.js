'use strict';

var config = require('../../../../../config/config');
var url= 'https://' + config.host + ':' + config.portHttps;

describe('dashboard page language test', function() {

  it('should be correct language on specified path', function() {

    //Check english version

    //If you need to interact with a non-Angular page, you may access the wrapped webdriver instance directly with `browser.driver`
    //see api-overview.md in grunt-protractor-runner module for details
    var driver = browser.driver;
    driver.get(url + '/en');

    expect(
      driver.findElement(By.id('signin')).getText()
    ).toEqual('Sign in');

    driver.findElement(By.id('signin')).click();

    //now we use "A helper function for finding and interacting with DOM elements" - see  api-overview.md
    expect(element(By.id('signin')).getText()).
      toEqual('Sign In');

    //Check russian version

    driver.get(url + '/ru');

    expect(
      driver.findElement(By.id('signin')).getText()
    ).toEqual('Вход');

    driver.findElement(By.id('signin')).click();

    expect(element(By.id('signin')).getText()).
        toEqual('Войти');

  });
});