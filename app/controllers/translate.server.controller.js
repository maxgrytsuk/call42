'use strict';

/**
 * Module dependencies.
 */
var translations = require('../data/translations'),
  Detector = require('../../app/services/detector.server.service');

/**
 * send translations
 */
exports.run = function(req, res) {
  if (req.query.lang && translations[req.query.lang]) {
    res.json(translations[req.query.lang]);
  } else {
    return res.status(404).send({
      message: 'Wrong language param provided'
    });
  }
};

exports.detectLanguage = function(req, res) {
  var ip = req._remoteAddress;
  return res.json({lang:Detector.detectLanguage(ip)});
};
