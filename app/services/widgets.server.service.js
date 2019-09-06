'use strict';

var Q = require('q'),
  fs = require('fs'),
  _ = require('lodash'),
  path = require('path'),
  URL = require('url-parse'),
  translations = require('../data/translations'),
  Detector = require('../../app/services/detector.server.service'),
  UrlService = require('../../app/services/url.server.service'),
  UserService = require('../../app/services/user.server.service'),
  mongoose = require('mongoose'),
  Widget = mongoose.model('Widget'),
  CallbackRequest = mongoose.model('CallbackRequest'),
  ChannelSettingsService = require('../../app/services/channelSettings.server.service'),
  config = require('../../config/config')
  ;
require('mongoose-query-paginate');

var WidgetService = this;
module.exports = WidgetService;

WidgetService.hiddenFields = '-created -updated -__v';
WidgetService.autoInvitationMode = {
  bySchedule: 'BY_SCHEDULE',
  byOnlineChannel: 'BY_ONLINE_CHANNEL'
};

WidgetService.init = function(req) {
  var def = Q.defer(), lang, data = {};
  fs.readFile(path.resolve(__dirname, '../../public/widget/html/widget.html'),  'UTF-8', function read(err, html) {
    if (err) {
      throw err;
    }
    if (!_.isUndefined(req.widget.user.lang)) {
      lang = req.widget.user.lang;
    } else {
      lang = 'ru';
    }
    data.widget = req.widget.toJSON()['public'];
    _.forEach(data.widget.texts, function(v, k) {
      if (!_.isUndefined(translations[lang][v])) {
        data.widget.texts[k] = translations[lang][v];
      }
    });
    data.html = html;
    data.url = UrlService.getWidgetServerHost({protocol:'https', port: config.portHttps, hostname:req.hostname});
    data.shortUrl = UrlService.getWidgetServerHost({port: config.portHttps, hostname:req.hostname});
    var phoneCodeData = Detector.getPhoneCodeData(req._remoteAddress);
    var phoneCode = '+';
    if (phoneCodeData) {
      phoneCode = Detector.extractPhoneCodePrefix(phoneCodeData.mask);
    }
    data.phoneCode = phoneCode;
    def.resolve(data);
  });
  return def.promise;
};

WidgetService.findByID = function(spec) {
  var def = Q.defer(),
    fields =  {};
  if (spec.fields) {
    fields = spec.fields;
  }



  Widget.findById(spec.id)
    .select(fields.widget)
    .populate('channels.model', fields.channel)
    .populate('user', fields.user)
    .deepPopulate([
      'user.currency'
    ])
    .exec(function(err, widget) {
      if (err || !widget) {
        def.resolve(null);
      } else {
        def.resolve(widget);
      }
    });

  return def.promise;
};

WidgetService.findCall42Widgets = function() {
  var promises = [];
  promises.push(this.findCall42Widget('ru'));
  promises.push(this.findCall42Widget('en'));
  return Q.all(promises);
};

WidgetService.findCall42Widget = function(lang) {
  var def = Q.defer();

  Widget.findOne({name:'call42' + lang}).populate({
    path: 'user',
    match: { name: 'call42'}
  }).exec(function(err, widget) {
    if (err || !widget) {
      def.resolve(null);
    } else {
      def.resolve(widget);
    }
  });

  return def.promise;
};

WidgetService.list = function(spec) {
  var def = Q.defer();

  var query =  Widget
    .find({user:spec.userId})
    .select(this.hiddenFields)
    .populate('channels.model', ChannelSettingsService.hiddenFields)
    .populate('user', UserService.hiddenFields)
    .sort('-created');

  query.exec(function(err, widgets) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(widgets);
    }
  });

  return def.promise;
};

WidgetService.create = function(req) {
  var def = Q.defer(),
    widget = req.body,
    user = req.user;

  widget.user = user._id;

  Widget.create(widget, function(err, doc) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(doc.toJSON());
    }
  });

  return def.promise;
};

WidgetService.update = function(req) {
  var def = Q.defer(),
    widget = req.widget;

  widget = _.extend(widget, req.body);

  widget.save(function(err) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve();
    }
  });
  return def.promise;
};

WidgetService.delete = function(req) {
  var def = Q.defer(), self = this;

  var widgetId = req.widget.id;
  self.removeWidget(req.widget)
    .then(function() {
      return self.removeCallbackRequests(widgetId);
    })
    .then(function() {
      return ChannelSettingsService.removeChannels(widgetId);
    })
    .then(function() {
      def.resolve();
    })
    .fail(function(err) {
      def.reject(err);
    });

  return def.promise;
};

WidgetService.editWidget = function(widgetId, action) {
  var def = Q.defer();

  Widget.update({'_id':widgetId}, action, function(err){
    if (err) {
      def.reject(err);
    } else {
      def.resolve();
    }
  });

  return def.promise;
};

WidgetService.refreshChannelsIndexes = function(spec) {
  var def = Q.defer(), idx = 0;

  Widget.findById(spec.widgetId).exec(function(err, widget) {
    if (err) {
      def.reject(err);
    } else {
      idx = 0;
      _.forEach(widget.channels, function(channel) {
        channel.idx = idx;
        idx += 1;
      });
      widget.save(function(err) {
        if (err) {
          def.reject(err);
        } else {
          def.resolve();
        }
      });
    }
  });

  return def.promise;
};

WidgetService.removeWidget = function(widget) {
  var def = Q.defer();
  widget.remove(function (err) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve();
    }
  });
  return def.promise;
};

WidgetService.removeCallbackRequests = function(widgetId) {
  var def = Q.defer();
  CallbackRequest.remove({widget: widgetId}, function (err) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve();
    }
  });
  return def.promise;
};
