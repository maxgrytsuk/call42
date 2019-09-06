'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  UserService = require('../services/user.server.service'),
  BillingService = require('../../app/services/billing.server.service'),
  fs = require('fs'),
  _ = require('lodash');

/**
 * List of Users
 */
exports.usersList = function(req, res) {
  UserService.findUsers(req.user)
    .then(function(users) {
      res.json(users);
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Show user data
 */
exports.findUser = function(req, res) {
  var profile = req.profile.toJSON();
  delete profile.password;
  delete profile.salt;
  res.json(profile);
};

exports.updateUser = function(req, res) {
  UserService.updateUser(req.params.userId, req.body)
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
 * Delete user
 */
exports.deleteUser = function(req, res) {
  UserService.deleteUser(req.profile)
    .then(function(data) {
      var result = data?'OK':'NO';
      res.json({result:result});
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Get user balance count
 */
exports.getUserBalanceCount = function(req, res) {
  BillingService.getUserBalanceCount(req.profile._id)
    .then(function(data) {
      res.json({count:data});
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Login as user
 */
exports.loginAsUser = function(req, res) {
  var user = req.profile;
  req.session.loggedAsUser = user._id;
  req.login(user, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(user);
    }
  });
};

/**
 * Download user's log
 */
exports.downloadLog = function(req, res) {
  var fileName = req.profile.id + '.log';
  var file = __dirname + '/../../logs/' + fileName;
  fs.exists(file, function (exists) {
    if (exists) {
      res.download(file, fileName);
    } else {
      res.json({result:'NOT_EXIST'});
    }
  });

};

/**
 * Delete user's log
 */
exports.deleteLog = function(req, res) {
  var fileName = req.profile.id + '.log';
  var file = __dirname + '/../../logs/' + fileName;
  fs.exists(file, function (exists) {
    if (exists) {
      fs.unlink(file, function(data) {
        res.json({result:'OK'});
      });
    } else {
      res.json({result:'NOT_EXIST'});
    }
  });
};