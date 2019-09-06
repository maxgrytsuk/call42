'use strict';

var Q = require('q'),
  _ = require('lodash'),
  mongoose = require('mongoose'),
  LogService = require('../../app/services/log.server.service'),
  DateHelper = require('../../app/services/dateHelper.server.service'),
  PaymentService = require('../services/payment.server.service'),
  Balance = mongoose.model('Balance'),
  User = mongoose.model('User');

var BalanceService = this;
module.exports = BalanceService;


BalanceService.balanceTypes = {
  notificationsMonthlyAccrual:'BILLING_ACCRUAL_NOTIFICATIONS_MONTHLY',
  notificationsReturnAccrual:'BILLING_ACCRUAL_NOTIFICATIONS_RETURN',
  notificationsWithdrawal:'BILLING_WITHDRAWAL_NOTIFICATIONS',
  moneyAccrual:'BILLING_ACCRUAL_MONEY',
  moneyReturnAccrual:'BILLING_ACCRUAL_MONEY_RETURN',
  moneyCardAccrual:'BILLING_ACCRUAL_MONEY_CARD',
  moneyWithdrawal:'BILLING_WITHDRAWAL_MONEY'
};

BalanceService.create = function() {
  return Object.create(this);
};

BalanceService.createBalanceItem = function(data) {
  var def = Q.defer();
  data.created = new Date();
  var item = new Balance(data), message, level;

  this.saveBalanceItem(item)
    .then(function(data) {
      def.resolve(data);
      level = LogService.level.info;
      message = 'Create balance item success, data "'+JSON.stringify(data)+'"';
    })
    .fail(function(err) {
      level = LogService.level.error;
      message = 'Create balance item error "'+JSON.stringify(err)+'", data "'+ JSON.stringify(data)+'"';
    })
    .fin(function() {
      LogService.log({message:message, user:data.user.toString(), category:'billing', level:level});
    });
  return def.promise;
};

BalanceService.saveBalanceItem = function(item) {
  var def = Q.defer();
  item.save(function(err, data) {
    err?def.reject(err):def.resolve(data);
  });
  return def.promise;
};

BalanceService.getBalance = function(spec) {
  var def = Q.defer(), data = {}, self = this;

  if (spec.userId) {
    data.user = spec.userId;
  }
  if (spec.type) {
    data.type = spec.type;
  }

  var query = Balance.find(data);

  if (spec.from) {
    query.where('created').gt(new Date(spec.from));
  }
  if (spec.to) {
    query.where('created').lt(DateHelper.addDay(new Date(spec.to), 1));
  }
  if (spec.sort) {
    query.sort(spec.sort);
  } else {
    query.sort('-created');
  }

  var options = {
    perPage: spec.perPage?spec.perPage:10,
    page   : spec.page?spec.page:1
  };

  query.deepPopulate([
    'notification.callbackRequest',
    'notification.callbackRequest.widget'
  ]);

  query.populate('payment');

  query.lean().paginate(options, function(err, data) {
    if (err) {
      def.reject(err);
    } else {
      if (spec.timezone) {
        _.forEach(data.results, function(item) {
          item.date = DateHelper.getDateByTimeZone(item.created, spec.timezone);
          if (item.notification && item.notification.callbackRequest) {
            item.notification.callbackRequest.date = DateHelper.getDateByTimeZone(item.notification.callbackRequest.created, spec.timezone);
          }
          if (item.payment && item.payment.info) {
            item.payment.info = PaymentService.filterPaymentInfo(item.payment);
          }
        });
      }
      def.resolve(data);
    }
  });
  return def.promise;
};

BalanceService.getTotal = function(spec) {
  var def = Q.defer(), self = this,
    match = [ { user:  mongoose.Types.ObjectId(spec.userId)} ];
  if (spec.from) {
    match.push( { created : { $gte: new Date(spec.from)}});
  }
  if (spec.to) {
    match.push( { created : { $lte: DateHelper.addDay(new Date(spec.to), 1)}});
  }

  Balance
    .aggregate(
    [
      {
        $match: {
          $and : [
            { $or : [ { type :self.balanceTypes.moneyReturnAccrual }, { type : self.balanceTypes.moneyWithdrawal } ] },
            { $and : match }
          ]
        }
      },
      {
        $group:
        {
          _id: spec.userId,
          totalAmount: { $sum: '$money' },
          totalCost: { $sum: '$cost' }
        }
      }
    ]
  )
    .exec(function (err, res) {
      if (err) {
        def.reject(err);
      } else {
        def.resolve(res[0]);
      }
    });
  return def.promise;
};

BalanceService.getBalanceItem = function(query) {
  var def = Q.defer();
  Balance.findOne(query, function(err, item) {
    err?def.reject(err):def.resolve(item);
  });
  return def.promise;
};

BalanceService.setNotificationCostToBalance = function(notifications) {
  var promises = [], self = this;
  _.forEach(notifications, function(notification) {
    promises.push(self.getBalanceItem({notification:notification})
      .then(function(balanceItem) {
        if (!_.isUndefined(notification.cost)) {
          balanceItem.cost = notification.cost;
          return self.saveBalanceItem(balanceItem);
        } else {
          return Q();
        }
      }));
  });
  return Q.all(promises);
};