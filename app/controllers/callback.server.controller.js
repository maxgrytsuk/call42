'use strict';

/**
 * Module dependencies.
 */
var CallbackManager = require('../../app/services/callbackManager.server.service'),
  UrlService = require('../../app/services/url.server.service'),
  WidgetService = require('../../app/services/widgets.server.service'),
  CallbackRequestService = require('../../app/services/callbackRequest.server.service'),
  self = this;

/**
 * Init widget
 */
exports.init = function(req, res) {
  WidgetService.init(req)
    .then(function(data){
      res.jsonp(data);
    });
};

/**
 * Process callback request
 */
exports.process = function(req, res) {
  var callbackRequest, callbackRequestToProcess;
  CallbackRequestService.isCallbackRequestExist({callbackRequestGuid:req.body.guid, user:req.widget.user})
    .then(function() {
      callbackRequest = CallbackRequestService.createCallbackRequest(req);
      return CallbackRequestService.saveCallbackRequest(callbackRequest);
    })
    .then(function(callbackRequest) {
      callbackRequestToProcess = callbackRequest;
      return CallbackManager.isWidgetHasChannels(req.widget);
    })
    .then(function() {
      var callbackManager = CallbackManager.create({
        widget:req.widget,
        callbackRequest:callbackRequestToProcess
      });
      callbackManager.processRequest();

      //do not wait for callback request notification result, it is checked in getCallbackRequestStatus
      res.json({result:'OK'});
    })
    .fail(function(err) {
      res.json({result:'fail'});
    })
    .done()
  ;
};

/**
 * Check online status
 */
exports.checkOnlineStatus = function(req, res) {
  var callbackManager = CallbackManager.create({widget:req.widget});
  var mode = req.query.mode?req.query.mode:req.widget.public.auto_invitation.mode;
  callbackManager.checkOnlineStatus(mode)
    .then(function(result) {
      res.json(result?'on':'off');
    })
    .done();
};

/**
 * Get callback request status
 */
exports.getCallbackRequestStatus = function(req, res) {
  var callbackRequestService = CallbackRequestService.create();
  callbackRequestService.getStatus({guid:req.params.guid})
    .then(function(status) {
      if (status.done) {
        callbackRequestService.findOne({guid:req.params.guid, withNotifications:true}).then(function(callbackRequest) {
          status.dialog = CallbackManager.composeResponse(callbackRequest.notifications);
          res.json(status);
        });
      } else {
        res.json(status);
      }
    })
    .done();
};

/**
 * Check origin url middleware
 */
exports.checkUrl = function(req, res, next) {
  if (!req.widget) {
    return res.status(404).send({
      message: 'Wrong widget id'
    });
  }
  var result = UrlService.checkUrl({originUrl:req.headers.referer, urlsToCheck:req.widget.urls});
  if (!result) {
    return res.status(403).send({
      message: 'Wrong origin url'
    });
  }
  res.set('Access-Control-Allow-Origin', req.headers.origin);
  next();
};

exports.findWidget = function(req, res, next, id) {
  WidgetService.findByID({id:id})
    .then(function(widget){
      req.widget = widget;
      next();
    })
    .fail(function(err){
      next(err);
    });
};