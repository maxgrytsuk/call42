'use strict';
var Q = require('q'),
  ObjectID = require('bson-objectid'),
  _ = require('lodash');

var PaymentServiceMock = this;
module.exports = PaymentServiceMock;

PaymentServiceMock.create = function() {
  return Object.create(this);
};

PaymentServiceMock.payments = [];

PaymentServiceMock.findPaymentById = function(id) {
  var payment = _.find(this.payments, function(payment) {
    return payment.id === id;
  });
  return Q(payment);
};

PaymentServiceMock.updatePaymentById = function(spec) {
  var def = Q.defer();
   this.findPaymentById(spec.id)
     .then(function(payment) {
       payment = _.merge(payment, spec.data);
       payment.amount = spec.data.info.amount * 100;
       payment.status = spec.data.status?spec.data.status:payment.status;
       def.resolve(payment);
     });
  return def.promise;
};