'use strict';
var URL = require('url-parse'),
config = require('../../config/config');

exports.checkUrl = function(spec) {
  var urlsToCheck = spec.urlsToCheck.split(',');
  var originUrl = removeWWW( new URL(spec.originUrl) );
  return urlsToCheck.some(function(urlToCheck) {
    urlToCheck = removeWWW( new URL(urlToCheck.trim()) );
    return originUrl.hostname === urlToCheck.hostname && originUrl.port === urlToCheck.port;
  });
};

function removeWWW(url) {
  var urlHostnameSplit = url.hostname.split('.');
  if (urlHostnameSplit[0] === 'www') {
    url.hostname =  urlHostnameSplit.splice(1).join('.');
  }
  return url;
}

exports.getWidgetServerHost = function(spec) {
  var port = '', protocol = '';
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging') {
    port = ':' + spec.port;
  }
  if (spec.protocol) {
    protocol = spec.protocol + '://';
  }
  return protocol + spec.hostname + port;
};