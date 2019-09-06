'use strict';

/**
 * Module dependencies.
 */
var callback = require('../../app/controllers/callback.server.controller');

module.exports = function(app) {
  app.route('/request/:widget')
    .post(callback.checkUrl, callback.process);

  app.route('/onlineStatus/:widget')
    .get(callback.checkUrl, callback.checkOnlineStatus);

  app.route('/callbackRequestStatus/:widget/:guid')
    .get(callback.checkUrl, callback.getCallbackRequestStatus);

  app.route('/init/:widget')
    .get(callback.checkUrl, callback.init);

  app.param('widget', callback.findWidget);
};