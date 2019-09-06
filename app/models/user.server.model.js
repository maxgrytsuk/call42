'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  config = require('../../config/config'),
  crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
  return (this.provider !== 'local' || (property && property.length));
};

/**
 * A Validation function for password
 */
var validatePassword = function(password) {
  return ( (password && password.length > 6) || (this.provider !== 'local' && !password) );
};

/**
 * User Schema
 */
var UserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'VIEW_EDIT_PROFILE_EMAIL_PLACEHOLDER'],
    match: [/.+\@.+\..+/, 'VIEW_EDIT_PROFILE_EMAIL_VALIDATION']
  },
  username: {
    type: String,
    unique: 'VIEW_EDIT_PROFILE_UNIQUE_VALIDATION',
    required: 'VIEW_EDIT_PROFILE_REQUIRED_VALIDATION',
    trim: true
  },
  password: {
    type: String,
    default: '',
    validate: [validatePassword, 'VIEW_EDIT_PROFILE_PASSWORD_VALIDATION']
  },
  salt: {
    type: String
  },
  provider: {
    type: String
    //required: 'Provider is required'
  },
  providerData: {},
  additionalProvidersData: {},
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user']
  },
  updated: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  },
  last_digest_time: {
    type: Date,
    default: Date.now
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  timezone:{
    type: String,
    default:'GMT'
  },
  lang:{
    type: String,
    default:'en'
  },
  currency: {
    type: Schema.Types.ObjectId,
    ref:'Currency'
  },
  money: {
    type: Number
  },
  notifications: {
    type: Number,
    default:config.free_notifications_max
  },
  notifications_max: {
    type: Number,
    default:config.free_notifications_max
  },
  date:{
    type:String
  },
  doLogging:{
    type:Boolean
  }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
  if (this.password && this.password.length > 6) {
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
  var _this = this;
  var possibleUsername = username + (suffix || '');

  _this.findOne({
    username: possibleUsername
  }, function(err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};

mongoose.model('User', UserSchema);