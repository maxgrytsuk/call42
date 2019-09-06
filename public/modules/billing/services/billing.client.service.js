'use strict';

angular.module('billing')
  .factory('Billing', ['$resource',
    function($resource) {
      return $resource('billing', {}, {
        standardPrices: {
          method:'GET',
          url:'billing/standardPrices',
          params:{},
          isArray:true
        },
        prices: {
          method:'GET',
          url:'billing/prices',
          params:{},
          isArray:true
        },
        rates: {
          method:'GET',
          url:'billing/rates',
          params:{},
          isArray:true
        },
        currencies: {
          method:'GET',
          url:'billing/currencies',
          params:{},
          isArray:true
        },
        balance: {
          method:'GET',
          url:'billing/balance',
          params:{},
          isArray:false
        },
        createAccrual: {
          method:'POST',
          url:'billing/balance',
          params:{},
          isArray:false
        },
        updatePrices: {
          method:'PUT',
          url:'billing/prices',
          params:{},
          isArray:false
        },
        updateUserCurrency: {
          method:'PUT',
          url:'billing/user/currency',
          params:{},
          isArray:false
        },
        notificationsMax: {
          method:'GET',
          url:'billing/notificationsMax',
          params:{},
          isArray:false
        },
        getPaymentData: {
          method:'GET',
          url:'billing/liqpay',
          params:{},
          isArray:false
        },
        getTotal: {
          method:'GET',
          url:'billing/total',
          params:{},
          isArray:false
        },
        pay: {
          method:'POST',
          url:'billing/pay',
          params:{},
          isArray:false
        }
      });
    }
  ]);