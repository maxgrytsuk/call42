'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
  channelSettings = require('../../app/controllers/channelSettings.server.controller');

module.exports = function(app) {

  app.route('/channels')
    .post(users.requiresLogin, channelSettings.create);

  app.route('/channels/:channelId')
    .get(channelSettings.hasAuthorization, channelSettings.find)
    .delete(channelSettings.hasAuthorization, channelSettings.delete)
    .put(channelSettings.hasAuthorization, channelSettings.update);

  app.param('channelId', channelSettings.findByID);

};