'use strict';

module.exports = function(app) {
  // Root routing
  var core = require('../../app/controllers/core.server.controller');
  app.route('/app').get(core.app);
  app.route('/timezones').get(core.timezones);
  app.route('/phoneCode').get(core.phoneCode);
  app.route('/en').get(core.home);
  app.route('/ru').get(core.home);
  app.route('/').get(core.home);
  app.route('/paymentResult')
    .get(core.paymentResult)
    .post(core.paymentResult);
};