'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  config = require('../../config/config'),
  translations = require('../data/translations'),
  BillingService = require('../services/billing.server.service'),
  BalanceService = require('../services/balance.server.service'),
  UserService = require('../services/user.server.service'),
  _ = require('lodash');

/**
 * Get max free notifications
 */
exports.getNotificationsMax = function(req, res) {
  res.json({value:config.free_notifications_max});
};

/**
 * Notifications standard prices
 */
exports.getStandardPrices = function(req, res) {
  BillingService.getStandardPrices()
    .then(function(prices) {
      res.json(prices);
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Currency rates
 */
exports.getRates = function(req, res) {
  BillingService.getRates({date:req.query.date})
    .then(function(rates) {
      res.json(rates);
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Notifications prices
 */
exports.getPrices = function(req, res) {
  var userId = req.query.user?req.query.user:req.user.id;
  var currencyId = req.query.currency?req.query.currency:req.user.currency._id;
  BillingService.getPrices({userId:userId, currencyId:currencyId})
    .then(function(rates) {
      res.json(rates);
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

exports.getTotal = function(req, res) {
  var userId = req.query.userId?req.query.userId:req.user._id;
  BalanceService.getTotal({
    userId: userId,
    from:req.query.from,
    to:req.query.to
  })
    .then(function(data) {
      res.json(data);
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

exports.getCurrencies = function(req, res) {
  BillingService.getCurrencies()
    .then(function(currencies) {
      res.json(currencies);
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Get balance
 */
exports.getBalance = function(req, res) {
  var userId = req.query.userId?req.query.userId:req.user._id;
  BalanceService.getBalance({
    userId:userId,
    page:req.query.page,
    perPage:req.query.perPage,
    from:req.query.from,
    to:req.query.to,
    timezone:req.user.timezone
  })
    .then(function(balance) {
      res.json(balance);
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Create accrual
 */
exports.createAccrual = function(req, res) {
  var data = req.body, userToUpdate;
  UserService.findOne({_id:data.user})
    .then(function(user) {
      userToUpdate = user;
      data.type = BalanceService.balanceTypes.moneyAccrual;
      data.moneyCurrent = userToUpdate.money + data.money;
      data.freeCurrent = userToUpdate.notifications;
      if (!data.moneyCurrent) {
        data.moneyCurrent = 0;
      }
      return BalanceService.createBalanceItem(data);
    })
    .then(function() {
      if (!userToUpdate.money) {
        userToUpdate.money = 0;
      }
      return UserService.updateUser(data.user, {money:userToUpdate.money + data.money});
    })
    .then(function() {
      return res.send({
        message: 'success'
      });
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Update notification prices
 */
exports.updatePrices = function(req, res) {
  BillingService.updatePrices(req.body)
    .then(function() {
      return res.send({
        message: 'success'
      });
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

exports.getPaymentData = function(req, res) {
  var data = null;
  if (req.query.amount && req.user.currency) {
    data = BillingService.getPaymentData({
      amount:req.query.amount,
      currency:req.user.currency.name,
      lang:req.user.lang
    });
  }
  res.json(data);
};

exports.createPayment = function(req, res) {
  BillingService.createPayment({
    _id:req.body.orderId,
    service:'liqPay',
    amount:req.body.amount * 10000,
    currency:req.user.currency._id,
    user:req.user,
    status:'redirected_to_payment_page'
  }).then(function() {
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(function() {
        var status = req.body.amount === 1?'success':'failure';
        BillingService.emulateLiqPayServiceResponse({
            status:status,
            orderId:req.body.orderId,
            amount:req.body.amount,
            currency:req.user.currency.name
          });
      }, 5000);
    }
  });
};

exports.setPaymentStatus = function(req, res) {
  if (req.body && req.body.data) {
    BillingService.setPaymentStatus(req.body);
  }
};

exports.getPaymentStatus = function(req, res) {
  var lang = req.user && req.user.lang?req.user.lang:'en';
  BillingService.getPaymentStatus({orderId:req.query.orderId, user:req.user})
    .then(function(status) {
      res.json({
        status:status,
        text:translations[lang][BillingService.liqPayPaymentStatuses[status]]
      });
    });
};