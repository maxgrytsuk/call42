'use strict';

var Q = require('q'),
  mongoose = require('mongoose'),
  reversePopulate = require('mongoose-reverse-populate'),
  _ = require('lodash'),
  DateHelper = require('../../app/services/dateHelper.server.service'),
  UrlService = require('../../app/services/url.server.service'),
  LogService = require('../../app/services/log.server.service'),
  CallbackRequest = mongoose.model('CallbackRequest'),
  Notification = mongoose.model('Notification'),
  Balance = mongoose.model('Balance')
  ;


var CallbackRequestService = this;
module.exports = CallbackRequestService;

CallbackRequestService.init = function(spec) {
  return this;
};

CallbackRequestService.create = function() {
  var o = Object.create(this);
  this.init.apply(o, Array.prototype.slice.call(arguments));
  return o;
};

CallbackRequestService.createCallbackRequest = function(req) {
  return new CallbackRequest({
    widget: req.widget,
    user: req.widget.user.id,
    guid:req.body.guid,
    created: new Date(),
    data: {
      phone: req.body.phone,
      ip: req._remoteAddress,
      host:req.headers.host,
      widgetServerHost:UrlService.getWidgetServerHost({protocol:'https', hostname:req.hostname}),
      referer:req.headers.referer
    }
  });
};


CallbackRequestService.saveCallbackRequest = function(callbackRequest) {
  var def = Q.defer();
  callbackRequest.save(function (err) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(callbackRequest);
    }
  });
  return def.promise;
};


CallbackRequestService.isCallbackRequestExist = function(spec) {
  var def = Q.defer();
  this.findOne({guid:spec.callbackRequestGuid})
    .then(function(callbackRequest) {
      if (callbackRequest) {
        LogService.log({message:'Callback request with guid "' + spec.callbackRequestGuid + '" already exist', user:spec.user, category:'callbackRequest', level:LogService.level.info});
        def.reject();
      } else {
        def.resolve();
      }
    })
    .fail(function(err) {
      LogService.log({message:'Check is callback request exist error: "' + err + '"', user:spec.user, category:'callbackRequest', level:LogService.level.info});
      def.reject();
    })
  ;
  return def.promise;
};

CallbackRequestService.list = function(req) {
  var def = Q.defer(), self = this,
    query = this.getQuery(req.query, req.user);

  var options = {
    perPage: req.query.perPage?req.query.perPage:100000,
    page   : req.query.page?req.query.page:1
  };
  var paginatedData;
  self.paginate({query:query, options:options})
    .then(function(data) {
      paginatedData = data;
      paginatedData.results = DateHelper.setDatesByTimezone(data.results, req.user.timezone);
      paginatedData.results = self.modelsToJSON(paginatedData.results);
      return self.reversePopulate( {
        modelArray: paginatedData.results,
        storeWhere: 'notifications',
        arrayPop: true,
        mongooseModel: Notification,
        idField: 'callbackRequest'
      });
    })
    .then(function() {
      return self.populateNotificationsWithBalance(paginatedData.results);
    })
    .then(function() {
      def.resolve(paginatedData);
    })
    .fail(function(err){
      def.reject(err);
    })
  ;
  return def.promise;
};

CallbackRequestService.setResult = function(spec) {
  var def = Q.defer();
  var isSuccess = false;
  _.forEach(spec.notifications, function(notification) {
    if (notification.success) {
      isSuccess = true;
    }
  });
  spec.callbackRequest.result = isSuccess?'success':'failure';
  this.saveCallbackRequest(spec.callbackRequest)
    .then(function() {
      def.resolve();
    })
    .fail(function(err) {
      def.reject(err);
    });
  return def.promise;
};

CallbackRequestService.findOne = function(spec) {
  var def = Q.defer(), self = this;
  CallbackRequest.findOne({guid:spec.guid}, function(err, callbackRequest) {
    if (err) {
      def.reject(err);
    } else {
      if (spec.withNotifications) {
        self.reversePopulate( {
          modelArray: [callbackRequest],
          storeWhere: 'notifications',
          arrayPop: true,
          mongooseModel: Notification,
          idField: 'callbackRequest'
        }).then(function(callbackRequests) {
          def.resolve(callbackRequests[0]);
        });
      } else {
        def.resolve(callbackRequest);
      }
    }
  });
  return def.promise;
};

CallbackRequestService.getStatus = function(spec) {
  var def = Q.defer();
  CallbackRequest.findOne({guid:spec.guid}, function(err, callbackRequest) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve({done:callbackRequest.result?true:false});
    }
  });
  return def.promise;
};

CallbackRequestService.paginate = function(spec) {
  var def = Q.defer();
  spec.query.paginate(spec.options, function(err, data) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(data);
    }
  });
  return def.promise;
};

CallbackRequestService.reversePopulate = function(spec) {
  var def = Q.defer();
  reversePopulate(spec, function(err, data) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(data);
    }
  });
  return def.promise;
};

CallbackRequestService.populateNotificationsWithBalance = function(callbackRequests) {
  var self = this, promises = [];
  var spec = {
    storeWhere: 'balance',
    arrayPop: true,
    mongooseModel: Balance,
    idField: 'notification'
  };
  _.forEach(callbackRequests, function(callbackRequest) {
    callbackRequest.notifications = self.modelsToJSON(callbackRequest.notifications);
    spec.modelArray = callbackRequest.notifications;
    promises.push(self.reversePopulate(spec));

  });
  return Q.allSettled(promises);
};

CallbackRequestService.modelsToJSON = function(models) {
  if (!models || (models && !models.length)) return models;
  return models.map(function(model) {
    return model.toJSON();
  });
};

CallbackRequestService.export = function(req) {
  var def = Q.defer(), self = this,
    query = this.getQuery(req.query, req.user);

  query.exec(function(err, data) {
    def.resolve(DateHelper.setDatesByTimezone(data, req.user.timezone));
  });
  return def.promise;
};

CallbackRequestService.count = function(req) {
  var def = Q.defer(),
    query = {};
  if (req.user) {
    query.user = req.user._id;
  }
  if (req.widget) {
    query.widget = req.query.widget;
  }
  CallbackRequest.count(query).exec(function(err, data) {
    def.resolve(data);
  });
  return def.promise;
};

CallbackRequestService.getQuery = function(params, user) {
  var expression = {}, sort;
  if (user) {
    expression.user = user.id;
  }
  sort = params.sort?params.sort: '-created';
  if (params.phone) {
    var phone = params.phone;
    if (phone[0] === '+') {
      phone = '\\' + params.phone;
    }
    expression['data.phone']= new RegExp(phone);
  }

  var widget = params.widget && JSON.parse(params.widget);
  if (widget && widget.id) {
    expression.widget = widget.id;
  }

  if (params.status) {
    expression.result = params.status;
  }

  var query = CallbackRequest.find(expression)
    .select('created widget user data.phone data.referer')
    .populate({
      path:'widget',
      select:'name channels'
    })
    .sort(sort);

  if (params.period) {
    var date = DateHelper.getISODateFromNowByPeriod(Date.now(), params.period);
    query.where('created').gt(date);
  }

  return query;
};

/**
 * Set failure code for asterisk channel result when failure result is delayed
 *
 * @param {JSON} spec.
 * @api public
 */
CallbackRequestService.setFailureCode = function(spec) {
  CallbackRequest.findById(spec.callbackRequestId, function(err, callbackRequest) {
    _.forEach(callbackRequest.results, function(result) {
      if (result.channel.toString() === spec.channel.toString() && result.success === true) {
        result.info = {code:spec.code};
        result.success = false;
      }
    });
    callbackRequest.save(function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
};
