'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
  callbackRequests = require('../../app/controllers/callbackRequests.server.controller');

module.exports = function(app) {
  // callback requests routes

  app.route('/callbackRequests/export')
    .get(users.requiresLogin, callbackRequests.export);

  app.route('/callbackRequests/count')
    .get(users.requiresLogin, callbackRequests.count);

  app.route('/callbackRequests')
    .get(users.requiresLogin, callbackRequests.list);

};