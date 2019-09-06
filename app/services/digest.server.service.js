'use strict';

var Q = require('q'),
  _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Notification = mongoose.model('Notification'),
  config = require('../../config/config'),
  translations = require('../data/translations-server'),
  CallbackRequestService = require('../../app/services/callbackRequest.server.service'),
  DateHelper = require('../../app/services/dateHelper.server.service'),
  URL = require('url-parse'),
  emailService = require('../services/email.server.service'),
  UrlService = require('../services/url.server.service')
  ;

var DigestService = Object.create(this);
module.exports = DigestService;

DigestService.process = function() {
  var def = Q.defer(), self = this, data, callbackRequestsToProcess;
  self.findCallbackRequests()
    .then(function(callbackRequests) {
      callbackRequestsToProcess = CallbackRequestService.modelsToJSON(callbackRequests);
      return CallbackRequestService.reversePopulate({
        modelArray: callbackRequestsToProcess,
        storeWhere: "notifications",
        arrayPop: true,
        mongooseModel: Notification,
        populate:'channel',
        idField: "callbackRequest"
      });
    })
    .then(function() {
      data = self.composeData(callbackRequestsToProcess);
      return Q.allSettled(self.sendDigests(data));
    })
    .then(function(data) {
      return Q.allSettled(self.updateUserDigestsTime(data));
    })
    .then(function() {
      def.resolve();
    })
    .fail(function(err) {
      def.reject(err);
    });
  return def.promise;
};

DigestService.findCallbackRequests = function() {
  var def = Q.defer();
  var digestPeriod = config.digestPeriod;
  var date = DateHelper.getISODateFromNowByPeriod(Date.now(), digestPeriod);
  var query = CallbackRequestService.getQuery({
    period:digestPeriod,
    status:'failure'
  });
  query.populate({
    path:'user',
    match: { last_digest_time: { $lt: date }},
    select:'email lang timezone'
  });
  query.exec(function(err, callbackRequests) {
    if (err) {
      def.reject(err);
    } else {
      callbackRequests = _.reduce(callbackRequests, function(result, callbackRequest) {
        if (callbackRequest.user) {
          result.push(callbackRequest);
        }
        return result;
      }, []);
      def.resolve(callbackRequests);
    }
  });
  return def.promise;
};

DigestService.sendDigests = function(data) {
  var self = this;
  return _.reduce(data, function(results, callbackRequests, email) {
    results.push(self.sendDigest(email, callbackRequests));
    return results;
  }, []);
};

DigestService.sendDigest = function(email, callbackRequests) {
  var self = this, deferred = Q.defer(),
    user = callbackRequests[0].user,
    mailOptions = {
      to: email,
      from: config.mailer.from,
      subject: translations[user.lang].EMAIL_CALLBACK_REQUEST_DIGEST
    };
  var url = new URL(config.host);
  var emailViewData = {
    callbackRequests: callbackRequests,
    widgetServerHost: UrlService.getWidgetServerHost({hostname:url.href})
  };
  self.getEmailService().render('app/views/templates/callbackRequest-digest.server.view.html', emailViewData, user)
    .then(function(html) {
      mailOptions.html = html;
      return self.getEmailService().send(mailOptions);
    })
    .then(function() {
      deferred.resolve(email);
    })
    .fail(function(err) {
      deferred.reject(err);
    });
  return deferred.promise;
};

DigestService.updateUserDigestsTime = function(data) {
  var self = this;
  return _.reduce(data, function(results, item) {
    if (item.state === 'fulfilled') {
      results.push(self.updateUserDigestTime(item.value));
    }
    return results;
  }, []);
};

DigestService.updateUserDigestTime = function(userEmail) {
  var def = Q.defer();
  User.update(
    {
      email:userEmail
    },
    {
      $set:
      {
        last_digest_time:new Date()
      }
    },
    function(err) {
      if (err) {
        console.log('Some error on User update: ', err);
      }
      def.resolve();
    });
  return def.promise;
};

DigestService.composeData = function(callbackRequests) {
  return _.reduce(callbackRequests, function(data, callbackRequest) {
    if (!_.find(data, function(model, email){
        return email === callbackRequest.user.email;
      })
    ) {
      data[callbackRequest.user.email] = [];
    }
    data[callbackRequest.user.email].push(callbackRequest);
    return data;
  },{});
};

DigestService.getEmailService = function() {
  if (!this.emailService) {
    this.emailService = emailService;
  }
  return this.emailService;
};
