'use strict';

var Q = require('q'),
  request = require('request'),
  config = require('../../config/config'),
  mongoose = require('mongoose'),
  Rate = mongoose.model('Rate'),
  Currency = mongoose.model('Currency'),
  EmailService = require('../../app/services/email.server.service'),
  DateHelper = require('../../app/services/dateHelper.server.service'),
  LogService = require('../../app/services/log.server.service'),
  _ = require('lodash');


var CurrencyService = this;
module.exports = CurrencyService;


CurrencyService.create = function() {
  var o = Object.create(this);
  this.init.apply(o, Array.prototype.slice.call(arguments));
  return o;
};

CurrencyService.init = function(spec) {
  return this;
};

CurrencyService.convert = function(spec) {
  var def = Q.defer(), cost;

  if (spec.currencyFrom === spec.currencyTo) {
    def.resolve(spec.cost);
  } else {
    this.getLatestRate(spec)
      .then(function(item) {
        cost = item.currencyFrom === spec.currencyFrom?spec.cost * item.rate : spec.cost / item.rate;
        def.resolve(cost);
      })
      .fail(function(err) {
        def.reject(err);
      });
  }
  return def.promise;
};

CurrencyService.getLatestRate = function(spec) {
  var def = Q.defer(),app = require('../../server'), self = this;
  var key = 'rate_'+spec.currencyFrom + spec.currencyTo;

  app.storage.get(key, function(err, item) {
    if (err || self.isObsolete(item)) {
      Rate.
        findOne({ $or: [ { currencyFrom: spec.currencyFrom, currencyTo: spec.currencyTo }, { currencyTo: spec.currencyFrom, currencyFrom: spec.currencyTo } ] })
        .sort('-_id')
        .exec(function(err, item) {
          if (err || !item) {
            err = err?err:{message:'No data retrieved, spec: ' + JSON.stringify(spec)};
            def.reject(err);
          } else {
            app.storage.set(key, item.toJSON(), function() {
              def.resolve(item);
            });
          }
        });
    } else {
      def.resolve(item);
    }
  });

  return def.promise;
};

CurrencyService.isObsolete = function(item) {
  return !item || (item && item.date.getTime() + 24 * 60 * 60 * 1000 < Date.now());
};

CurrencyService.updateRates = function() {
  var def = Q.defer(), self = this;

  self.needToUpdateRates()
    .then(function(result){
      if (result) {
        self.getCurrencies()
          .then(function(currencies) {
            return self.getCurrentRates({currencies: currencies});
          })
          .then(function(rates) {
            return self.saveRates(rates);
          })
          .then(function(rates) {
            return self.notifyOfRateUpdate({rates:rates});
          })
          .then(function() {
            def.resolve();
          })
          .fail(function(err) {
            self.notifyOfRateUpdate({error:err});
            def.reject(err);
          });
      } else {
        def.resolve();
      }
    });

  return def.promise;
};

CurrencyService.needToUpdateRates = function() {
  var def = Q.defer(), self = this;

  Rate.
    findOne()
    .sort('-_id')
    .exec(function(err, item) {
      if (err || (item && DateHelper.getDay(new Date()) === DateHelper.getDay(item.date)) ) {
        def.resolve(false);
      } else {
        def.resolve(true);
      }
    });

  return def.promise;
};

CurrencyService.getCurrentRates = function(spec) {
  var t, rates = [], i = 1, json;
  var str = _.reduce(spec.currencies, function(str, currencyFrom) {
    _.forEach(spec.currencies.slice(i), function(currencyTo) {
      t = currencyFrom.name + currencyTo.name;
      str = !str ? t:  str + ',' + t;
    });
    i++;
    return str;
  }, '');
  var url = 'http://query.yahooapis.com/v1/public/yql';
  var data = {
    q :'select * from yahoo.finance.xchange where pair in ("'+str+'")',
    env : 'store://datatables.org/alltableswithkeys',
    format: 'json'
  };
  //{"query":{"count":2,"created":"2016-04-07T09:51:44Z","lang":"en-US",
  // "results":{"rate":[
  // {"id":"UAHRUB","Name":"UAH/RUB","Rate":"2.6243","Date":"4/7/2016","Time":"10:16am","Ask":"2.6263","Bid":"2.6243"},
  // {"id":"UAHUSD","Name":"UAH/USD","Rate":"0.0388","Date":"4/7/2016","Time":"10:15am","Ask":"0.0388","Bid":"0.0387"}]}}}
  var requestGet = Q.nbind(request.get, request);
  return requestGet({url:url, qs:data})
    .then(function(data) {
      try {
        json = JSON.parse(data[1]);
        _.forEach(json.query.results.rate, function(rate) {
          rates.push({
            currencyFrom:rate.Name.split('/')[0],
            currencyTo:rate.Name.split('/')[1],
            rate:rate.Rate,
            date:rate.Date
          })
        });
      } catch (e) {
        throw new Error('Response data parse error : "' + e + '", data:' + data)
      }
      return Q(rates);
    });
};

CurrencyService.getCurrencies = function() {
  var def = Q.defer();
  Currency.find(function(err, currencies) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(currencies);
    }
  });
  return def.promise;

};

CurrencyService.saveRates = function(data) {
  var self = this, promises = [];
  _.forEach(data, function(item) {
    promises.push(self.saveRate(new Rate(item)))
  });
  return Q.all(promises);

};

CurrencyService.saveRate = function(model) {
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

CurrencyService.notifyOfRateUpdate = function(data) {
  var self = this,
    def = Q.defer(),
    emailViewData = {},
    subject,
    mailOptions;

  if (!data.err && data.rates && data.rates.length) {
    emailViewData.rates = data.rates;
    subject = 'Обновление курса валют';
  } else {
    var message = data.err?data.err.error:data.error;
    emailViewData.errorText = 'Ошибка при обновлении курса валют: "' + message + '"';
    subject = 'Ошибка при обновлении курса валют';
  }

  self.getEmailService().render('app/views/templates/rates-update-notify.server.view.html', emailViewData)
    .then(function(html) {
      mailOptions = {
        to: config.mailer.to,
        from: config.mailer.from,
        subject: subject,
        html: html
      };
      return self.getEmailService().send(mailOptions);
    })
    .then(function() {
      def.resolve();
      LogService.log({message: 'Rates updated', category: 'currency', level: LogService.level.info});
    })
    .fail(function(err) {
      var message = 'Send email failure to "'+config.mailer.to+'", error: "' + JSON.stringify(err) + '"';
      LogService.log({message: message, category: 'currency', level: LogService.level.error});
      def.reject(err);
    });

  return def.promise;
};

CurrencyService.getEmailService = function() {
  if (!this.emailService) {
    this.emailService = EmailService;
  }
  return this.emailService;
};
