'use strict';

// Setting up route
angular.module('callbackRequests').config(['$stateProvider', 'lodash',
  function($stateProvider, _) {
    // Callback requests state routing
    $stateProvider.
      state('app.listCallbackRequests', {
        url: '/callbackRequests',
        templateUrl: 'modules/callbackRequests/views/callbackRequests.list.client.view.html',
        controller:'CallbackRequestsController',
        authenticationRequired: true,
        accessPermission: 'user'
      });
  }
]);