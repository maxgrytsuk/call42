'use strict';

// Setting up route
angular.module('admin').config(['$stateProvider',
  function($stateProvider) {
    // Admin state routing
    $stateProvider
      .state('app.users', {
        url: '/users',
        templateUrl: 'modules/admin/views/users.list.client.view.html',
        authenticationRequired: true,
        accessPermission: 'admin'
      })
      .state('app.adminSettings', {
        url: '/settings',
        templateUrl: 'modules/admin/views/admin.settings.client.view.html',
        authenticationRequired: true,
        accessPermission: 'admin'
      })
      .state('app.editUser', {
        url: '/user/:userId/edit',
        templateUrl: 'modules/admin/views/user.edit.client.view.html',
        authenticationRequired: true,
        accessPermission: 'admin'
      })
    ;
  }
]);