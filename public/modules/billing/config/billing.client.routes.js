'use strict';

// Setting up route
angular.module('billing').config(['$stateProvider',
  function($stateProvider) {
    // Widgets state routing
    $stateProvider
      .state('app.payment', {
        url: '/payment',
        templateUrl: 'modules/billing/views/payment.client.view.html',
        authenticationRequired: true,
        accessPermission: 'user'
      })
      .state('app.standardPrices', {
        url: '/prices',
        templateUrl: 'modules/billing/views/prices.client.view.html',
        authenticationRequired: true,
        accessPermission: 'user'
      })
      .state('app.paymentSuccess', {
        url: '/paymentSuccess',
        templateUrl: 'modules/billing/views/payment.success.client.view.html'
        //authenticationRequired: true,
        //accessPermission: 'user'
      })
    ;
  }
]);