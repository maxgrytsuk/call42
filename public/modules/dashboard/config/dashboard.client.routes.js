'use strict';

// Setting up route
angular.module('dashboard').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.
      state('app.dashboard', {
        url: '/',
        authenticationRequired: true,
        accessPermission: 'user',
        templateUrl: 'modules/dashboard/views/dashboard.client.view.html'
      });
  }
]);