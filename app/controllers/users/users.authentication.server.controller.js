'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  UserService = require('../../services/user.server.service')
  ;

/**
 * Signup
 */
exports.signup = function(req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  UserService.createUser({data:req.body, ip:req._remoteAddress, provider:'local'})
    .then(function(user) {
      req.login(user, function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          UserService.populateWith(user, 'currency')
            .then(function() {
              res.json(user);
            })
            .fail(function(err) {
              res.status(400).send(err);
            });
        }
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
  if (req.session.loggedAsUser && req.user.username !== 'admin') {//login as admin when logout as user (login as user functionality)
    var userId = req.session.loggedAsUser;
    req.session.loggedAsUser = null;
    UserService.findOne({username:'admin'})
      .then(function(user) {
        req.login(user, function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.redirect('/app#!/user/' + userId + '/edit');
          }
        });
      })
      //.fail(function(err){
      //  res.status(400).send(err);
      //})
    ;
  } else {
    req.logout();
    var lang = req.query.lang, path = '/';
    if (lang) {
      path += lang;
    }
    res.redirect(path);
  }
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
  return function(req, res, next) {
    passport.authenticate(strategy, function(err, user) {
      if (err || !user) {
        return res.redirect('/#!/signin');
      }

      UserService.setCurrency(user, req._remoteAddress)
        .then(function() {
          return UserService.saveUser(user);
        })
        .then(function() {
          return UserService.populateWith(user, 'currency');
        })
        .then(function() {
          req.login(user, function(err) {
            if (err) {
              return res.redirect('/#!/signin');
            }
            return res.redirect('/app');
          });
        })
        .fail(function(err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    UserService.findOne(searchQuery)
      .then(function(user) {
        if (!user) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
          UserService.findUniqueUsername(possibleUsername)
            .then(function(availableUsername) {
              var user = UserService.initUser({
                firstName: providerUserProfile.firstName,
                lastName: providerUserProfile.lastName,
                username: availableUsername,
                displayName: providerUserProfile.displayName,
                email: providerUserProfile.email,
                provider: providerUserProfile.provider,
                providerData: providerUserProfile.providerData
              });
              user.save(function(err) {
                return done(err, user);
              });
            });
        } else {
          return done(null, user);
        }
      })
      .fail(function(err) {
        return done(err);
      })
    ;
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) user.additionalProvidersData = {};
      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function(err) {
        return done(err, user, '/#!/settings/accounts');
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
  var user = req.user;
  var provider = req.param('provider');

  if (user && provider) {
    // Delete the additional provider
    if (user.additionalProvidersData[provider]) {
      delete user.additionalProvidersData[provider];

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');
    }

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
            res.json(user);
          }
        });
      }
    });
  }
};