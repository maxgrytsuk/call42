'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
  admin = require('../../app/controllers/admin.server.controller');

module.exports = function(app) {

  app.route('/admin/users')
    .get(users.requiresAdmin, admin.usersList);

  app.route('/admin/users/:userId/balance/count')
    .get(users.requiresAdmin, admin.getUserBalanceCount);

  app.route('/admin/users/:userId')
    .get(users.requiresAdmin, admin.findUser)
    .put(users.requiresAdmin, admin.updateUser)
    .delete(users.requiresAdmin, admin.deleteUser);

  app.route('/admin/loginAsUser/:userId')
    .get(users.requiresAdmin, admin.loginAsUser);

  app.route('/admin/log/:userId')
    .get(users.requiresAdmin, admin.downloadLog)
    .delete(users.requiresAdmin, admin.deleteLog)
  ;

  app.param('userId', users.userByID);

};