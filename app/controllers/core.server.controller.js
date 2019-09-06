'use strict';

/**
 * Module dependencies.
 */
var moment = require('moment-timezone'),
  Detector = require('../../app/services/detector.server.service'),
  config = require('../../config/config'),
  WidgetService = require('../../app/services/widgets.server.service'),
  UrlService = require('../../app/services/url.server.service'),
  _ = require('lodash'),
  swig = require('swig')
  ;

var self = this;

exports.app = function(req, res) {
  var widget_ru, widget_en, lang, widget, data;
  WidgetService.findCall42Widgets()
    .then(function(widgets){
      widget_ru =widgets[0]._id.toString();
      widget_en = widgets[1]._id.toString();
      lang = req.user?req.user.lang:req.query.lang?req.query.lang:'en';
      widget = lang === 'ru'?widget_ru:widget_en;
      data = {
        user: req.user || null,
        request: req,
        widget_server_host: UrlService.getWidgetServerHost({protocol:'https', hostname:req.hostname}),
        lang:lang,
        widget_ru:widget_ru,
        widget_en:widget_en,
        widget_id: widget
      };
      if (process.env.NODE_ENV === 'production') {
        data.analytics_inner = (swig.compileFile('./app/views/analytics.inner.server.view.html'))();
        data.analytics_outer = (swig.compileFile('./app/views/analytics.outer.server.view.html'))();
      }
      res.render('app', data);
    });
};

exports.paymentResult = function(req, res) {
  var lang = 'en';
  if (req.query.lang) {
    lang = req.query.lang;
  }
  res.render('paymentResult-'+lang, {
    order: {id:req.query.orderId}
  });
};

exports.home = function(req, res) {
  if (req.user) {
    res.redirect('/app');
  } else {
    var lang= req.path.slice(1);
    if (['en', 'ru'].indexOf(lang) === -1) {
      lang = Detector.detectLanguage(req._remoteAddress);
    }
    if (!lang) {
      lang = 'en';
    }
    var port = '';
    if (config.port) {
      port = ':' + config.port;
    }
    var call42WidgetId = '';
    WidgetService.findCall42Widget(lang)
      .then(function(widget){
        if (widget) {
          call42WidgetId = widget._id.toString();
        }
        var data =  {
          layout:'layout.home',
          request: req,
          widget_server_host: UrlService.getWidgetServerHost({protocol:'https', hostname:req.hostname}),
          widget_id: call42WidgetId
        };
        if (process.env.NODE_ENV === 'production') {
          data.analytics_outer = (swig.compileFile('./app/views/analytics.outer.server.view.html'))();
        }
        res.render('home-' + lang, data);
      });
  }
};

exports.timezones = function(req, res) {
  res.json(moment.tz.names());
};

exports.phoneCode = function(req, res) {
  var phoneCodeData = Detector.getPhoneCodeData(req._remoteAddress);
  var phoneCode = phoneCodeData?phoneCodeData.mask:null;
  if (phoneCode) {
    phoneCode = Detector.removeDelimiters(phoneCode);
  }
  res.json({phoneCode:phoneCode});
};