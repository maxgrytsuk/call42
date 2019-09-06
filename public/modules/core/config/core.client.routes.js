'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'modules/core/views/app.client.view.html'
      })
      .state('app.welcome', {
        url: '/welcome',
        authenticationRequired: true,
        accessPermission: 'user',
        templateUrl: 'modules/dashboard/views/dashboard.client.view.html'
      })
      .state('app.start', {
        url: '/start',
        authenticationRequired: true,
        accessPermission: 'user',
        templateUrl: 'modules/dashboard/views/dashboard.client.view.html'
      })
    ;
  }
]);