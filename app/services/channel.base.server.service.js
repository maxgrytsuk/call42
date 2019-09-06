'use strict';

var Q = require('q'),
  _ = require('lodash');

var ChannelBase = this;
module.exports = ChannelBase;

ChannelBase.create = function() {
  return Object.create(this);
};

ChannelBase.setData = function(data) {
  this.data = data;
};
