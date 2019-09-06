'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../controllers/errors.server.controller'),
  CallbackRequestService = require('../../app/services/callbackRequest.server.service');

/**
 * List of Callback Requests
 */
exports.list = function(req, res) {
  CallbackRequestService.list(req)
    .then(function(data){
      res.send(data);
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Count of Callback Requests
 */
exports.count = function(req, res) {
  CallbackRequestService.count(req)
    .then(function(data){
      res.json({count:data});
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * List of Callback Requests for export
 */
exports.export = function(req, res) {
  CallbackRequestService.export(req)
    .then(function(data){
      res.send( { data: JSON.stringify(data) } );
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * List of Callback Requests for report
 */
exports.report = function(req, res) {
  CallbackRequestService.report(req)
    .then(function(data){
      res.send( data );
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};