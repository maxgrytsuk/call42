'use strict';
var Q = require('q'),
  _ = require('lodash'),
  CallbackRequestService = require('../../services/callbackRequest.server.service');

var CallbackRequestServiceMock = Object.create(CallbackRequestService);
module.exports = CallbackRequestServiceMock;


CallbackRequestServiceMock.findOne = function(spec) {
  var def = Q.defer();
  var callbackRequest = _.find(this.callbackRequests, function(callbackRequest) {
    return callbackRequest.guid === spec.guid;
  });
  def.resolve(callbackRequest);
  return def.promise;
};

CallbackRequestServiceMock.callbackRequests = [];