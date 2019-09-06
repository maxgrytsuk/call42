'use strict';

var Q = require('q'),
  _ = require('lodash'),
  config = require('../../config/config'),
  mongoose = require('mongoose'),
  atob = require('atob'),
  iconv  = require('iconv'),
  translations = require('../data/translations'),
  UserService = require('../services/user.server.service'),
  LogService = require('../../app/services/log.server.service'),
  PaymentService = require('../services/payment.server.service'),
  BalanceService = require('../services/balance.server.service'),
  DateHelper = require('../services/dateHelper.server.service'),
  LiqPay = require('../services/liqpay.server.service'),
  EmailService = require('../services/email.server.service'),
  ChannelSettingsService = require('../services/channelSettings.server.service'),
  ObjectID = require('bson-objectid'),
  Price = mongoose.model('Price'),
  Rate = mongoose.model('Rate'),
  Currency = mongoose.model('Currency'),
  Balance = mongoose.model('Balance')
  ;

var BillingService = this;
module.exports = BillingService;

BillingService.create = function() {
  return Object.create(this);
};

BillingService.notificationTypes = {
  email:'EMAIL',
  sms:'SMS',
  asterisk:'ASTERISK'
};
/*
 https://www.liqpay.com/ru/doc/callback

 success - успешный платеж
 failure - неуспешный платеж
 wait_secure - платеж на проверке
 wait_accept - Деньги с клиента списаны, но магазин еще не прошел проверку
 processing - Платеж обрабатывается
 sandbox - тестовый платеж
 reversed - Возврат клиенту после списания
 * */
BillingService.liqPayPaymentStatuses = {
  redirected_to_payment_page:'LIQPAY_STATUS_REDIRECTED_TO_PAYMENT_PAGE',//initial status, set before sending to liqpay
  success:'LIQPAY_STATUS_SUCCESS',
  failure:'LIQPAY_STATUS_FAILURE',
  wait_secure:'LIQPAY_STATUS_WAIT_SECURE',
  wait_accept:'LIQPAY_STATUS_WAIT_ACCEPT',
  processing:'LIQPAY_STATUS_PROCESSING',
  sandbox:'LIQPAY_STATUS_SANDBOX',
  reversed:'LIQPAY_STATUS_REVERSED'
};

BillingService.findPrice = function(spec) {
  var def = Q.defer();
  Price.findOne({
    currency:spec.currency,
    notification_type:spec.notificationType
  }, function(err, item) {
    if (err) {
      def.reject(err);
    } else if (!item){
      def.reject({message:'Notification price was not found, data "' +JSON.stringify(spec)+'"'});
    } else {
      def.resolve(item.price);
    }
  });
  return def.promise;
};

BillingService.getStandardPrices = function() {
  var def = Q.defer();
  Price.find().populate('currency')
    .exec(function(err, prices) {
      if (err) {
        def.reject(err);
      } else {
        def.resolve(prices);
      }
    });
  return def.promise;
};

BillingService.getRates = function(spec) {
  var def = Q.defer();

  var dateFrom = new Date();
  dateFrom.setTime(spec.date);

  var dateTo = new Date();
  dateTo.setTime(parseInt(spec.date) + 24 * 60 * 60 * 1000);

  var query = Rate.find({date:{$gt:dateFrom, $lt:dateTo}});
  var queryExec = Q.nbind(query.exec, query);

  queryExec()
    .then(function(rates) {
      if (rates.length) {
        def.resolve(rates);
      } else {
        //latest rate
        query = Rate.findOne().sort({date:-1});
        return  Q.nbind(query.exec, query)();
      }
    })
    .then(function(latestRate) {
      query = Rate.find({date:latestRate.date});
      return  Q.nbind(query.exec, query)();
    })
    .then(function(rates) {
      def.resolve(rates);
    })
    .fail(function(err) {
      def.reject(err);
    });

  return def.promise;
};

BillingService.getPrices = function(spec) {
  var def = Q.defer(), self = this, channelPrices;
  var query = Price.find({currency:spec.currencyId}).populate('currency').lean();
  var queryExec = Q.nbind(query.exec, query);
  queryExec()
    .then(function(prices) {
      return ChannelSettingsService.getChannelsWithPrices({user:spec.userId})
        .then(function(channels) {
          //transform channels data into prices format
          channelPrices = _.map(channels, function(channel) {
            return {param: self.getChannelParam(channel), notification_type:channel.type.toUpperCase(), price: channel.price, currency:{name:user.currency.name}}
          });
          //remove base prices if special prices are present
          prices = _.filter(prices, function(item) {
            return _.findIndex(channelPrices, function(channelPrice) {
                return item.notification_type === channelPrice.notification_type;
              }) === -1;
          });
          prices = _.union(channelPrices, prices);
          def.resolve(prices);
        })
    })
    .fail(function(err) {
      def.reject(err);
    });
  return def.promise;
};

BillingService.getChannelParam = function(channel) {
  switch (channel.type) {
    case 'sms':
      return channel.nativeParams.phone;
    case 'email':
      return channel.nativeParams.emails;
    case 'asterisk':
      return channel.nativeParams.host + ':' + channel.nativeParams.port;
    default :
      return '';
  }
};

/**
 * Update a prices
 */
BillingService.updatePrices = function(items) {
  var promises = [];
  _.forEach(items, function(item) {
    promises.push(BillingService.updatePrice(item));
  });
  return Q.all(promises);
};

BillingService.updatePrice = function(item) {
  var def = Q.defer();
  Price.update({_id:item._id},  { $set: { price: item.price }}).exec(function(err, data) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve();
    }
  });
  return def.promise;
};

BillingService.getCurrencies = function() {
  var def = Q.defer();
  Currency.find()
    .exec(function(err, currencies) {
      if (err) {
        def.reject(err);
      } else {
        def.resolve(currencies);
      }
    });
  return def.promise;
};

BillingService.getCurrencyName = function(currencyId) {
  var def = Q.defer();
  Currency.findOne({
    _id:currencyId
  }, function(err, item) {
    if (err) {
      def.reject(err);
    } else if (!item){
      def.reject({message:'Currency was not found, data "' +JSON.stringify(currencyId)+'"'});
    } else {
      def.resolve(item.name);
    }
  });
  return def.promise;
};

BillingService.getPaymentData = function(spec) {
  var liqPay = new LiqPay(this.getLiqPayConfig().public_key, this.getLiqPayConfig().private_key);
  var orderId = ObjectID.generate();
  var params =  {
    version:3,
    public_key:this.getLiqPayConfig().public_key,
    amount:spec.amount,
    currency:spec.currency,
    description: translations[spec.lang].LIQPAY_PAYMENT_DESCRIPTION,
    order_id:orderId,
    server_url:config.host + ':' + config.port + '/billing/liqpay/status',
    result_url:config.host + ':' + config.port + '/paymentResult?lang='+spec.lang+'&orderId=' + orderId,
    language:spec.lang,
    sandbox:this.getLiqPayConfig().sandbox
  };

  return {
    data:liqPay.cnb_data(params),
    signature:liqPay.cnb_signature(params),
    orderId:orderId
  };
};

BillingService.createPayment = function(data) {
  var def = Q.defer();
  PaymentService.createPayment(data)
    .then(function(data) {
      def.resolve(data);
      LogService.log({message:'Create payment success, data "' +JSON.stringify(data)+ '"', user:data.user.toString(), category:'billing', level:LogService.level.info});
    })
    .fail(function(err) {
      def.reject(err);
      LogService.log({message:'Create payment error, data "' +JSON.stringify(data)+'", error "'+JSON.stringify(err)+'"', user:data.user.toString(), category:'billing', level:LogService.level.error});
    })
  ;
  return def.promise;
};

BillingService.getPaymentStatus = function(spec) {
  var def = Q.defer(), self = this;
  self.getPaymentService().findPaymentById(spec.orderId)
    .then(function(payment) {
      if (payment && payment.status) {
        def.resolve(payment.status);
      } else {
        def.reject({message:'payment was not found'});
      }
    })
    .fail(function(err) {
      def.reject(err);
      LogService.log({message:'Get payment status error, order id: ' + spec.orderId, user:spec.user, category:'billing', level:LogService.level.error});
    });
  return def.promise;
};

BillingService.setPaymentStatus = function(data) {
  var def = Q.defer(), self = this;
  self.checkLiqPayData(data)
    .then(function() {
      return self.decodeData(data);
    })
    .then(function(dataDecoded) {
      return [dataDecoded, self.getPaymentStatus({
        orderId:dataDecoded.order_id
      })];
    })
    .spread(function(dataDecoded, paymentStatus) {
      LogService.log({message:'Set payment status, decoded data: ' + JSON.stringify(dataDecoded), category:'billing', level:LogService.level.info});

      //do not process if payment status is already 'success' or 'failure'
      var status = BillingService.liqPayPaymentStatuses[paymentStatus];
      if (status !== self.liqPayPaymentStatuses.success && status !== self.liqPayPaymentStatuses.failure) {
        return self.getPaymentService().updatePaymentById({
          id:dataDecoded.order_id,
          data:{
            status: dataDecoded.status,
            info: dataDecoded
          }
        });
      } else {
        return Q();
      }
    })
    .then(function(payment) {
      var promises = [];
      if (payment) {
        var status = BillingService.liqPayPaymentStatuses[payment.status],
          statuses = BillingService.liqPayPaymentStatuses;
        if (status === statuses.success || status === statuses.failure) {
          promises.push(self.makeLiqPayAccrual(payment));
          if (status === statuses.success) {
            var money = _.isUndefined(payment.user.money)?payment.amount:payment.user.money + payment.amount;
            promises.push(self.getUserService().updateUser(payment.user.id, {money:money}));
          }
          self.notifyOfPayment({payment:payment, widgetServerHost:config.host});
        }
      }
      return promises;
    })
    .spread(function() {
      def.resolve();
    })
    .fail(function(err) {
      def.reject(err);
      LogService.log({message:err, category:'billing', level:LogService.level.error});
    });

  return def.promise;
};


BillingService.notifyOfPayment = function(spec) {
  var data = {
    user:spec.payment.user,
    mailTo:config.mailer.to,
    templatePath: 'app/views/templates/payment-info.server.view.html',
    emailData:{
      payment:spec.payment,
      widgetServerHost:spec.widgetServerHost
    }
  };
  var status = BillingService.liqPayPaymentStatuses[spec.payment.status];
  if (status === BillingService.liqPayPaymentStatuses.success) {
    data.subject = 'Payment success notification';
    data.emailData.text = 'Successful payment';
  }
  if (status === BillingService.liqPayPaymentStatuses.failure) {
    data.subject = 'Payment failure notification';
    data.emailData.text = 'Payment failure';
  }
  if (status === BillingService.liqPayPaymentStatuses.sandbox) {
    data.subject = 'Test payment notification';
    data.emailData.text = 'Payment testing';
  }
  if (data.subject) {
    this.getEmailService().process(data)
      .fail(function(err) {
        LogService.log({message:err, user:spec.payment.user, category:'payment', level:LogService.level.error});
      });
  }
};

BillingService.makeLiqPayAccrual = function(payment) {
  var user = payment.user, moneyCurrent = user.money, money = 0;
  if (payment.status === 'success') {
    moneyCurrent = _.isUndefined(moneyCurrent)?payment.amount:moneyCurrent + payment.amount;
    money = payment.amount;
  }
  return this.getBalanceService().createBalanceItem({
    user: user.id,
    payment: payment.id,
    money : money,
    notifications: 0,
    freeCurrent: user.notifications,
    moneyCurrent: moneyCurrent,
    type : this.getBalanceService().balanceTypes.moneyCardAccrual
  });
};

BillingService.checkLiqPayData = function(liqPayData) {
  var def = Q.defer(),
    liqPayConfig = this.getLiqPayConfig(),
    liqPay = new LiqPay(liqPayConfig.public_key, liqPayConfig.private_key),
    sign = liqPay.str_to_sign(
      liqPayConfig.private_key +
      liqPayData.data +
      liqPayConfig.private_key
    );
  if (sign === liqPayData.signature) {
    def.resolve();
  } else {
    def.reject({message:'Wrong LiqPay signature. Data: ' + JSON.stringify(liqPayData)});
  }
  return def.promise;
};

BillingService.decodeData = function(liqPayDataEncoded) {
  var def = Q.defer(), dataDecodedStr, dataDecoded;
  dataDecodedStr = atob(liqPayDataEncoded.data);
  try {
    dataDecoded = JSON.parse(dataDecodedStr);
    dataDecoded = BillingService.fixLiqPayEncoding(dataDecoded);
    dataDecoded = BillingService.filterLiqPayData(dataDecoded);
    def.resolve(dataDecoded);
  } catch (e) {
    def.reject({message:'Incorrect data:' + dataDecodedStr});
  }
  return def.promise;
};

BillingService.fixLiqPayEncoding = function(data) {
  var conv = new iconv.Iconv( 'utf8', 'ISO-8859-1');
  data.description = conv.convert(data.description).toString();
  if (data.err_description) {
    data.err_description = conv.convert(data.err_description).toString();
  }
  return data;
};

BillingService.filterLiqPayData = function(data) {
  var excludedFields = ['receiver_commission', 'agent_commission', 'commission_credit', 'transaction_id'];
  return _.reduce(data, function(result, value, key) {
    if (excludedFields.indexOf(key) === -1) {
      result[key] = value;
    }
    return result;
  }, {});
};

BillingService.emulateLiqPayServiceResponse = function(data) {
  var request = require('request');
  request({
    uri:config.host + ':' + config.port + '/billing/liqpay/status',
    method: 'POST',
    form: this.getLigPayServiceResponseData(data)
  }, function(error, response, body) {
    console.log(body);
  });
};

BillingService.getLigPayServiceResponseData = function(data) {
  var liqPayConfig= this.getLiqPayConfig(),
    liqPay = new LiqPay(liqPayConfig.public_key, liqPayConfig.private_key);
  data.public_key = liqPayConfig.public_key;
  var params = this.getTestingParams(data);
  return {
    data:liqPay.cnb_data(params),
    signature:liqPay.cnb_signature(params)
  };
};

BillingService.getUserBalanceCount = function(user) {
  var def = Q.defer();
  Balance.count({user:user}).exec(function(err, data) {
    def.resolve(data);
  });
  return def.promise;
};

BillingService.setUserService = function(service) {
  this.userService = service;
};

BillingService.getUserService = function() {
  if (_.isEmpty(this.userService)){
    this.userService = UserService.create();
  }
  return this.userService;
};

BillingService.setPaymentService = function(service) {
  this.paymentService = service;
};

BillingService.getPaymentService = function() {
  if (_.isEmpty(this.paymentService)){
    this.paymentService = PaymentService.create();
  }
  return this.paymentService;
};

BillingService.setBalanceService = function(service) {
  this.balanceService = service;
};

BillingService.getBalanceService = function() {
  if (_.isEmpty(this.balanceService)){
    this.balanceService = BalanceService.create();
  }
  return this.balanceService;
};

BillingService.getLiqPayConfig = function() {
  if (this.liqPayConfig) {
    return this.liqPayConfig;
  }
  return config.payment.liqPay;
};

BillingService.setLiqPayConfig = function(config) {
  this.liqPayConfig = config;
};

BillingService.setEmailService = function(emailService) {
  this.emailService = emailService;
};

BillingService.getEmailService = function() {
  if (!this.emailService){
    this.emailService = EmailService.create();
  }
  return this.emailService;
};

BillingService.getTestingParams = function(data) {
  var params =  {
    action : 'pay',
    payment_id: 111111111,
    status:data.status,
    version : 3,
    type : 'buy',
    public_key: data.public_key,
    acq_id : 414963,
    order_id : data.orderId,
    liqpay_order_id : '969340u1453999451463181',
    description: 'ТЕСТ - call42 оплата за оповещения',
    sender_phone : '380664014790',
    sender_card_mask2 : '516875*11',
    sender_card_bank : 'pb',
    sender_card_country : 804,
    ip : '176.38.114.22',
    amount:data.amount,
    currency:data.currency,
    sender_commission : 0,
    amount_debit : 1,
    amount_credit: 1,
    commission_debit : 0,
    commission_credit : 0.03,
    currency_debit : 'UAH',
    currency_credit : 'UAH',
    sender_bonus : 0,
    amount_bonus : 0,
    mpi_eci : '7'
  };
  if (data.status === 'success') {
    params.transaction_id = 123995095;
    params.receiver_commission = 0.03;
  } else if (data.status === 'failure') {
    params.err_code = 'test error';
    params.err_description = 'ТЕСТ - при оплате суммы отличной от 1 эмулируется ошибочный статус платежа';
  }
  return params;
};
/* "action" : "pay",
 "payment_id" : 123995095,
 "status" : "success",
 "version" : 3,
 "type" : "buy",
 "public_key" : "i20944093946",
 "acq_id" : 414963,
 "order_id" : "56aa451f6a504505907a0c14",
 "liqpay_order_id" : "969340u1453999451463181",
 "description" : "call42 Ð¾Ð¿Ð»Ð°ÑÐ° Ð·Ð° ÑÐ²ÐµÐ´Ð¾Ð¼Ð»ÐµÐ½Ð¸Ñ",
 "sender_phone" : "380664014790",
 "sender_card_mask2" : "516875*11",
 "sender_card_bank" : "pb",
 "sender_card_country" : 804,
 "ip" : "176.38.114.22",
 "amount" : 1,
 "currency" : "UAH",
 "sender_commission" : 0,
 "receiver_commission" : 0.03,
 "agent_commission" : 0,
 "amount_debit" : 1,
 "amount_credit" : 1,
 "commission_debit" : 0,
 "commission_credit" : 0.03,
 "currency_debit" : "UAH",
 "currency_credit" : "UAH",
 "sender_bonus" : 0,
 "amount_bonus" : 0,
 "authcode_debit" : "213643",
 "rrn_debit" : "000315275231",
 "mpi_eci" : "7",
 "transaction_id" : 123995095
 */
/*
 "action" : "pay",
 "payment_id" : 140467693,
 "status" : "failure",
 "err_code" : "err_payment",
 "version" : 3,
 "type" : "buy",
 "public_key" : "i20944093946",
 "acq_id" : 414963,
 "order_id" : "56d93b231dc9873752b5dfa2",
 "liqpay_order_id" : "G9US6TTA1457077226956607",
 "description" : "call42 оплата за уведомления",
 "sender_phone" : "380633307374",
 "sender_card_mask2" : "423922*90",
 "sender_card_bank" : "Raiffeisen Bank Aval PJSC",
 "sender_card_country" : 804,
 "ip" : "178.150.162.167",
 "amount" : 2,
 "currency" : "UAH",
 "sender_commission" : 0,
 "amount_debit" : 2,
 "amount_credit" : 2,
 "commission_debit" : 0,
 "currency_debit" : "UAH",
 "currency_credit" : "UAH",
 "sender_bonus" : 0,
 "amount_bonus" : 0,
 "mpi_eci" : "7",
 "is_3ds" : false,
 "code" : "err_payment"
 */