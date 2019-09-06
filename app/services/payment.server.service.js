'use strict';

var Q = require('q'),
  _ = require('lodash'),
  mongoose = require('mongoose'),
  Widget = mongoose.model('Widget'),
  Payment = mongoose.model('Payment'),
  User = mongoose.model('User');

var PaymentService = this;
module.exports = PaymentService;

PaymentService.payment_fields = {
  sender_card_mask2:'PAYMENT_FIELD_CARD_MASK',
  sender_card_bank:'PAYMENT_FIELD_CARD_BANK',
  service:'PAYMENT_FIELD_SERVICE',
  sender_phone:'PAYMENT_FIELD_SENDER_PHONE',
  description:'PAYMENT_FIELD_DESCRIPTION',
  payment_id:'PAYMENT_FIELD_ORDER_ID',
  amount:'PAYMENT_FIELD_AMOUNT',
  err_code:'PAYMENT_FIELD_ERR_CODE',
  err_description:'PAYMENT_FIELD_ERR_DESCRIPTION'
};

PaymentService.create = function() {
  return Object.create(this);
};

PaymentService.createPayment = function(data) {
  var def = Q.defer();
  data.user = data.user.id;
  var payment = new Payment(data);
  payment.save(function(err, data) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(data);
    }
  });
  return def.promise;
};

PaymentService.findPaymentById = function(id) {
  var def = Q.defer();
  Payment.findById(id).populate('user').populate('currency').exec(function(err, payment) {
    if (err) {
      def.reject(err);
    } else if (!payment) {
      def.reject({message:'LiqPay response with status "success", but payment document with order ID "' + id + '" was not found'});
    } else {
      def.resolve(payment);
    }
  });
  return def.promise;
};

PaymentService.updatePaymentById = function(spec) {
  var def = Q.defer(), self = this,
    paymentUpdate = Q.nbind(Payment.update, Payment);

  paymentUpdate({_id:spec.id}, {$set: spec.data})
    .then(function(){
      return self.findPaymentById(spec.id);
    })
    .then(function(payment) {
      def.resolve(payment);
    })
    .fail(function(err) {
      def.reject(err);
    });
  return def.promise;
};

PaymentService.filterPaymentInfo = function(payment) {
  var self = this;
  payment.info = _.reduce(payment.info, function(result, v, k) {
    if (_.keys(self.payment_fields).indexOf(k) !== -1) {
      k = self.payment_fields[k];
      result[k] = v;
    }
    return result;
  }, {});
  payment.info[self.payment_fields.service] = payment.service;
  return payment.info;
};