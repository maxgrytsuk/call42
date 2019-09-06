'use strict';

var Q = require('q'),
  _ = require('lodash');

var ChannelBaseMock = this;
module.exports = ChannelBaseMock;

ChannelBaseMock.create = function() {
  return Object.create(this);
};

ChannelBaseMock.isSupportCheckOnline = function() {
  return typeof this.isOnline === 'function';
};

ChannelBaseMock.setData = function(data) {
  this.data = data;
};
