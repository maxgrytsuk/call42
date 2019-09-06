'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
  widgets = require('../../app/controllers/widgets.server.controller');

module.exports = function(app) {
  // widgets routes
  app.route('/widgets')
    .get(users.requiresLogin, widgets.list)
    .post(users.requiresLogin, widgets.create);

  app.route('/widgets/:widgetId')
    .get(widgets.hasAuthorization, widgets.findOne)
    .put(widgets.hasAuthorization, widgets.update)
    .delete(widgets.hasAuthorization, widgets.delete);

  app.param('widgetId', widgets.findByID);

};