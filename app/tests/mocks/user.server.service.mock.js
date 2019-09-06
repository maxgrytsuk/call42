'use strict';
var Q = require('q'), _ = require('lodash');

var UserServiceMock = this;
module.exports = UserServiceMock;

UserServiceMock.create = function() {
  return Object.create(this);
};

UserServiceMock.user = {};

UserServiceMock.setUser = function(user) {
  this.user = user;
};

UserServiceMock.updateUser = function(userId, data) {
  this.user = _.merge(this.user, data);
  return Q(this.user);
};

UserServiceMock.findOne = function() {
  return Q(this.user);
};