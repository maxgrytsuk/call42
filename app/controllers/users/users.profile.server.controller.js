'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  ChannelSettingsService = require('../../services/channelSettings.server.service'),
  User = mongoose.model('User'),
  Currency = mongoose.model('Currency')
  ;

/**
 * Update user details
 */
exports.update = function(req, res) {
  // Init Variables
  var user = req.user;
  var message = null;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    var prevCurrency = user.currency;
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            user.populate('currency', function(err, user) {
              if (prevCurrency.id !== user.currency.id) {
                ChannelSettingsService.convertSpecialPrices({user:user, currencyFrom:prevCurrency.name});
              }
              res.json(user);
            });

          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};

exports.changeLanguage = function(req, res) {
  if (req.user) {
    var query =  {
      username:req.user.username
    };
    if (req.user.email) {
      query.email = req.user.email;
    }
    User.update(query,
      {
        $set:{
          lang:req.body.lang
        }
      },
      function(err) {
        if (err) {
          console.log('Some error on User update: ', err);
        }
        res.json({success:'OK'});
      });
  } else {
    res.json({success:'NOT'});
  }
};