'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  DateHelper = require('../../../app/services/dateHelper.server.service'),
  UserService = require('../../../app/services/user.server.service');

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
  UserService.findOne({_id:id})
    .then(function(user) {
      if (!user) return next(new Error('Failed to load User ' + id));
      var users = DateHelper.setDatesByTimezone([user], req.user.timezone);
      req.profile = users[0];
      next();
    })
    .fail(function(err) {
      return next(err);
    });
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({
      message: 'User is not logged in'
    });
  }

  next();
};

/**
 * Require admin routing middleware
 */
exports.requiresAdmin = function(req, res, next) {
  if (req.user && req.user.roles.indexOf('admin') !== -1) {
    next();
  } else {
    return res.status(401).send({
      message: 'Access denied'
    });
  }

};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
  var _this = this;

  return function(req, res, next) {
    _this.requiresLogin(req, res, function() {
      if (_.intersection(req.user.roles, roles).length) {
        return next();
      } else {
        return res.status(403).send({
          message: 'User is not authorized'
        });
      }
    });
  };
};