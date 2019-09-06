'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../controllers/errors.server.controller'),
  WidgetService = require('../../app/services/widgets.server.service'),
  ChannelSettingsService = require('../../app/services/channelSettings.server.service');


/**
 * Create a channel
 */
exports.create = function(req, res) {
  ChannelSettingsService.createChannel({channel:req.body, user:req.user})
    .then(function(channel) {
      return ChannelSettingsService.saveChannel(channel)
        .then(function(channel) {
          return WidgetService.editWidget(channel.idWidget ,  {'$push':{'channels':{ idx:req.query.channelIdx, model:channel._id }}})
            .then(function(){
              res.send(channel);
            })
        });
    })
    .fail(function(err){
      return res.status(400).send(err);
    });
};

/**
 * Update a channel settings
 */
exports.update = function(req, res) {

  ChannelSettingsService.update(req)
    .then(function(data){
      res.send(data);
    })
    .fail(function(err){
      return res.status(400).send(err);
    });

};

/**
 * Delete channel
 */
exports.delete = function(req, res) {
  ChannelSettingsService.delete({channel:req.channel, channelIdx:req.query.channelIdx})
    .then(function() {
      res.send({
        success: 'OK'
      });
    })
    .fail(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });

};

/**
 * Find channel by id
 */
exports.findByID = function(req, res, next, id) {
  ChannelSettingsService.findByID(req, id)
    .then(function(channel){
      req.channel = channel;
      next();
    })
    .fail(function(err){
      next(err);
    });
};

/**
 * Show channel data
 */
exports.find = function(req, res) {
  res.json(req.channel);
};

/**
 * Channel authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  ChannelSettingsService.hasAuthorization(req)
    .then(function(){
      next();
    })
    .fail(function(err){
      return res.status(403).send(err);
    });
};