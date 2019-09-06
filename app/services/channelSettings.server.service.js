'use strict';

var Q = require('q'),
  mongoose = require('mongoose'),
  Widget = mongoose.model('Widget'),
  Price = mongoose.model('Price'),
  ChannelSettings = mongoose.model('ChannelSettings'),
  ChannelSettingsEmail = require('../../app/models/channelSettings.email.server.model'),
  ChannelSettingsAsterisk = require('../../app/models/channelSettings.asterisk.server.model'),
  ChannelSettingsSms = require('../../app/models/channelSettings.sms.server.model'),
  SmsService = require('../../app/services/sms.server.service'),
  WidgetService = require('../../app/services/widgets.server.service'),
  CurrencyService = require('../../app/services/currency.server.service'),
  BillingService = require('../services/billing.server.service'),
  BalanceService = require('../services/balance.server.service'),
  LogService = require('../../app/services/log.server.service'),
  _ = require('lodash');

var ChannelSettingsService = this;
module.exports = ChannelSettingsService;

ChannelSettingsService.hiddenFields = '-__v -nativeParams.secret';

ChannelSettingsService.createChannel = function(spec) {
  var def = Q.defer(), model, channel;

  switch (spec.channel.type) {
    case 'email':
      model = new ChannelSettingsEmail(spec.channel);
      def.resolve(model);
      break;
    case 'asterisk':
      model = new ChannelSettingsAsterisk(spec.channel);
      def.resolve(model);
      break;
    case 'sms':
      this.getSmsChannelPrice({user:spec.user, channel:spec.channel})
        .then(function(price) {
          if (price) {
            spec.channel.price = price;
          }
          model = new ChannelSettingsSms(spec.channel);
          def.resolve(model);
        })
        .fail(function(err) {
          LogService.log({message: err, user: spec.user, category: 'sms', level: LogService.level.error});
          def.reject({message:'VIEW_CHANNEL_EDIT_SMS_PHONE_VALIDATION'});
        })
      ;
      break;
    default:
      LogService.log({message: 'Unknown channel type provided', user: spec.user, category: 'channel', level: LogService.level.fatal});
      def.reject({
        message: 'Unknown channel type provided'
      });
  }

  return def.promise;
};

ChannelSettingsService.getSmsChannelPrice = function(spec) {
  var self = this;
  return SmsService.detectAdvantageousService({phone:spec.channel.nativeParams.phone, user: spec.user})
    .then(function(service) {
      spec.channel.nativeParams.service = service.name;
      return self.getChannelPrice({cost:service.cost, currency: spec.user.currency._id.toJSON(), type: BillingService.notificationTypes.sms});
    })
};

ChannelSettingsService.convertSpecialPrices = function(spec) {
  var promises = [], self = this;
  WidgetService.list({userId:spec.user.id})
    .then(function(widgets){
      _.forEach(widgets, function(widget) {
        _.forEach(widget.channels, function(channel) {
          if (channel.model.price) {
            if (channel.model.type === 'sms') {
              self.getSmsChannelPrice({user:spec.user, channel:channel.model})
                .then(function(price) {
                  channel.model.price = parseInt(price);
                  promises.push(self.save(channel.model));
                })
            } else {
              CurrencyService.convert({cost:channel.model.price, currencyFrom:spec.currencyFrom, currencyTo:spec.user.currency.name})
                .then(function(cost) {
                  channel.model.price = parseInt(cost);
                  promises.push(self.save(channel.model));
                })
            }
          }
        })
      })
      ;
    })
  ;
  return Q.all(promises);
};

ChannelSettingsService.getChannelPrice = function (spec) {
  var def = Q.defer();
  this.getBillingService().findPrice({
    currency:spec.currency,
    notificationType:spec.type
  })
    .then(function(price) {
      if (spec.cost > price/2) {
        price = price/2 + spec.cost;
      }
      def.resolve(price);
    })
    .fail(function(err) {
      def.reject(err);
    })
  ;
  return def.promise;
};

ChannelSettingsService.getChannelsWithPrices = function (spec) {
  var def = Q.defer(), channels = [];
  WidgetService.list({userId:spec.userId})
    .then(function(widgets) {
      _.forEach(widgets, function(widget) {
        _.forEach(widget.channels, function(channel) {
          if (channel.model.price) {
            channels.push(channel.model);
          }
        })
      });
      def.resolve(channels);
    })
    .fail(function(err) {
      def.reject(err);
    });
  return def.promise;
};

ChannelSettingsService.update = function(req) {
  var channel = req.channel,
    secret = channel.nativeParams.secret;

  channel = _.extend(channel, req.body);
  if (!req.body.nativeParams.secret) {
    channel.nativeParams.secret = secret;
  }
  return this.save(channel);
};

ChannelSettingsService.save = function(channel) {
  var def = Q.defer();

  channel.save(function(err, doc) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(doc);
    }
  });

  return def.promise;
};

ChannelSettingsService.delete = function(spec) {
  var def = Q.defer(), self = this;
  var channelId = spec.channel._id,
    widgetId = spec.channel.idWidget;

  self.removeChannel(spec.channel)
    .then(function() {
      return WidgetService.editWidget(widgetId,  {'$pull':{channels:{model:channelId}}});
    })
    .then(function() {
      return WidgetService.refreshChannelsIndexes({widgetId:widgetId});
    })
    .then(function() {
      def.resolve();
    })
    .fail(function(err){
      def.reject(err);
    });

  return def.promise;
};

ChannelSettingsService.findByID = function(req, id) {
  var def = Q.defer();
  ChannelSettings.findById(id).populate('widget', ['id', 'name']).exec(function(err, channel) {
    if (err) {
      def.reject(err);
    } else if (!channel) {
      def.reject({message:'Failed to load channel settings' + id});
    } else {
      def.resolve(channel);
    }

  });
  return def.promise;
};

/**
 * Channel authorization middleware
 */
ChannelSettingsService.hasAuthorization = function(req) {
  var def = Q.defer();
  if (req.user && req.channel) {
    Widget.findById(req.channel.idWidget).populate('user').exec(function(err, widget) {
      if (!widget || (widget.user.id !== req.user.id && req.user.roles.indexOf('admin') === -1) ) {
        def.reject({
          message: 'User is not authorized'
        });
      } else {
        def.resolve();
      }
    });
  } else {
    def.reject({
      message: 'User is not set'
    });
  }
  return def.promise;
};

ChannelSettingsService.saveChannel = function(model) {
  var def = Q.defer();
  model.save(function(err, doc) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(doc.toJSON());
    }
  });
  return def.promise;
};

ChannelSettingsService.removeChannel = function(channel) {
  var def = Q.defer();

  channel.remove(function(err) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve();
    }
  });

  return def.promise;
};

ChannelSettingsService.removeChannels = function(widgetId) {
  var def = Q.defer();
  ChannelSettings.remove({idWidget: widgetId}, function (err) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve();
    }
  });
  return def.promise;
};

ChannelSettingsService.setBillingService = function(service) {
  this.billingService = service;
};

ChannelSettingsService.getBillingService = function() {
  if (!this.billingService){
    this.billingService = BillingService.create();
  }
  return this.billingService;
};

ChannelSettingsService.setBalanceService = function(service) {
  this.balanceService = service;
};

ChannelSettingsService.getBalanceService = function() {
  if (!this.balanceService){
    this.balanceService = BalanceService.create();
  }
  return this.balanceService;
};
