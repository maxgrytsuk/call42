'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  config = require('../../../config/config'),
  nodemailer = require('nodemailer'),
  async = require('async'),
  swig = require('swig'),
  translations = require('../../data/translations-server'),
  Polyglot = require('node-polyglot'),
  UrlService = require('../../services/url.server.service'),
  crypto = require('crypto');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res, next) {
  async.waterfall([
    // Generate random token
    function(done) {
      crypto.randomBytes(20, function(err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by username
    function(token, done) {
      if (req.body.username) {
        User.findOne({
          username: req.body.username
        }, '-salt -password', function(err, user) {
          if (!user) {
            return res.status(400).send({
              message: 'VIEW_RESET_PASSWORD_NO_ACCOUNT'
            });
          } else if (user.provider !== 'local') {
            return res.status(400).send({
              message: 'VIEW_RESET_PASSWORD_SIGHNUP_WITH_SOCIAL_ACCOUNT',
              data:user.provider
            });
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function(err) {
              done(err, token, user);
            });
          }
        });
      } else {
        return res.status(400).send({
          message: 'VIEW_RESET_PASSWORD_BLANK_USERNAME'
        });
      }
    },
    function(token, user, done) {
      swig.setFilter('translate', function (input) {
        return translations[user.lang][input];
      });
      res.render('templates/reset-password-email', {
        name: user.displayName,
        appName: config.app.title,
        widgetServerHost:UrlService.getWidgetServerHost({protocol:'https', hostname:req.hostname}),
        url: 'https://' + req.headers.host + '/auth/reset/' + token
      }, function(err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function(emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: translations[user.lang].EMAIL_RESET_PASSWORD_SUBJECT,
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if (!err) {
          res.send({
            message: 'VIEW_RESET_PASSWORD_SEND_EMAIL_SUCCESS',
            data: user.email
          });
        } else {
          return res.status(400).send({
            message: 'VIEW_RESET_PASSWORD_SEND_EMAIL_FAILURE'
          });
        }

        done(err);
      });
    }
  ], function(err) {
    if (err) return next(err);
  });
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (!user) {
      return res.redirect('/app#!/password/reset/invalid');
    }

    res.redirect('/app#!/password/reset/' + req.params.token);
  });
};

/**
 * Reset password POST from email token
 */
exports.reset = function(req, res, next) {
  // Init Variables
  var passwordDetails = req.body;

  async.waterfall([

    function(done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function(err, user) {
        if (!err && user) {
          if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
            user.password = passwordDetails.newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

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
                    // Return authenticated user
                    res.json(user);

                    done(err, user);
                  }
                });
              }
            });
          } else {
            return res.status(400).send({
              message: 'VIEW_RESET_PASSWORD_DO_NOT_MATCH'
            });
          }
        } else {
          return res.status(400).send({
            message: 'VIEW_RESET_PASSWORD_TOKEN_EXPIRED'
          });
        }
      });
    },
    function(user, done) {
      swig.setFilter('translate', function (input) {
        return translations[user.lang][input];
      });
      var polyglot = new Polyglot();
      polyglot.extend( translations[user.lang]);
      res.render('templates/reset-password-confirm-email', {
        name: user.displayName,
        text:polyglot.t('EMAIL_RESET_PASSWORD_CONFIRMATION', {name: user.username}),
        widgetServerHost:UrlService.getWidgetServerHost({protocol:'https', hostname:req.hostname}),
        appName: config.app.title
      }, function(err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function(emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: translations[user.lang].EMAIL_RESET_PASSWORD_RESET_SUCCESS_SUBJECT,
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function(err) {
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
  });
};

/**
 * Change Password
 */
exports.changePassword = function(req, res) {
  // Init Variables
  var passwordDetails = req.body;

  if (req.user) {
    if (passwordDetails.newPassword) {
      User.findById(req.user.id, function(err, user) {
        if (!err && user) {
          if (user.roles.indexOf('admin') !== -1) {
            User.findById(req.body.userId, function(err, user) {
              updatePassword(req, res, {user:user, passwordDetails:passwordDetails,  doLogin: false});
            });
          } else if (user.authenticate(passwordDetails.currentPassword) || (user.provider !== 'local' && !user.password)) {
            updatePassword(req, res, {user:user, passwordDetails:passwordDetails, doLogin: true});
          } else {
            res.status(400).send({
              message: 'VIEW_EDIT_PASSWORD_VALIDATION_CURRENT_INCORRECT'
            });
          }
        } else {
          res.status(400).send({
            message: 'User is not found'
          });
        }
      });
    } else {
      res.status(400).send({
        message: 'VIEW_EDIT_PASSWORD_VALIDATION_REQUIRED'
      });
    }
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

function updatePassword(req, res, spec) {
  if (spec.passwordDetails.newPassword === spec.passwordDetails.verifyPassword) {
    spec.user.password = spec.passwordDetails.newPassword;

    spec.user.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else if (spec.doLogin) {
        req.login(spec.user, function(err) {
          if (err) {
            return res.status(400).send(err);
          } else {
            return res.send({
              message: 'VIEW_EDIT_PASSWORD_SUCCESS'
            });
          }
        });
      } else {
        return res.send({
          message: 'VIEW_EDIT_PASSWORD_SUCCESS'
        });
      }
    });
  } else {
    return res.status(400).send({
      message: 'VIEW_EDIT_PASSWORD_VALIDATION_DO_NOT_MATCH'
    });
  }
}
