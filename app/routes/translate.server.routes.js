'use strict';

/**
 * Module dependencies.
 */
var translate = require('../../app/controllers/translate.server.controller');

module.exports = function(app) {
  app.route('/translate')
    .get(translate.run);

  app.route('/detectLanguage')
    .get(translate.detectLanguage);

};