'use strict';

var errorHandler = require('../controllers/errors.server.controller'),
  ChannelSettingsService = require('../../app/services/channelSettings.server.service'),
  UserService = require('../../app/services/user.server.service'),
  WidgetService = require('../../app/services/widgets.server.service')
  ;

exports.findByID = function(req, res, next, id) {
  WidgetService.findByID({
    id:id,
    fields:{
      widget:WidgetService.hiddenFields,
      user: UserService.hiddenFields,
      channel: ChannelSettingsService.hiddenFields
    }
  })
    .then(function(widget){
      req.widget = widget;
      next();
    })
    .fail(function(err){
      next(err);
    });
};

/**
 * List of widgets
 */
exports.list = function(req, res) {
  var userId = req.query.user?req.query.user:req.user._id;
  WidgetService.list({userId:userId})
    .then(function(widgets){
      res.json(widgets);
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Show widget data
 */
exports.findOne = function(req, res) {
  res.json(req.widget);
};


/**
 * Create a widget
 */
exports.create = function(req, res) {

  WidgetService.create(req)
    .then(function(doc){
      res.send(doc);
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });

};

/**
 * Update a widget
 */
exports.update = function(req, res) {

  WidgetService.update(req)
    .then(function(){
      res.send({'success':'OK'});
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });

};


/**
 * Delete a widget
 */
exports.delete = function(req, res) {

  WidgetService.delete(req)
    .then(function(){
      res.send({'success':'OK'});
    })
    .fail(function(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });

};

/**
 * Widget authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.widget.user.id !== req.user.id) {
    return res.status(403).send({
      message: 'User is not authorized'
    });
  }
  next();
};