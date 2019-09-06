'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
  billing = require('../../app/controllers/billing.server.controller');

module.exports = function(app) {

  app.route('/billing/notificationsMax')
    .get(users.requiresAdmin, billing.getNotificationsMax);

  app.route('/billing/standardPrices')
    .get(billing.getStandardPrices);

  app.route('/billing/prices')
    .get(billing.getPrices)
    .put(users.requiresAdmin, billing.updatePrices);

  app.route('/billing/rates')
    .get(billing.getRates);

  app.route('/billing/currencies')
    .get(billing.getCurrencies);

  app.route('/billing/balance')
    .post(users.requiresLogin, billing.createAccrual)
    .get(users.requiresLogin, billing.getBalance);

  app.route('/billing/liqpay/status')
    .get(billing.getPaymentStatus)
    .post(billing.setPaymentStatus);

  app.route('/billing/liqpay')
    .get(billing.getPaymentData);

  app.route('/billing/total')
    .get(billing.getTotal);

  app.route('/billing/pay')
    .post(billing.createPayment);

  app.param('userId', users.userByID);

};