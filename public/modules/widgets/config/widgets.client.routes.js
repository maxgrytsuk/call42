'use strict';

// Setting up route
angular.module('widgets').config(['$stateProvider',
  function($stateProvider) {
    // Widgets state routing
    $stateProvider.
      state('app.listWidgets', {
        url: '/widgets',
        templateUrl: 'modules/widgets/views/widgets.client.view.html',
        authenticationRequired: true,
        accessPermission: 'user'
      })
      .state('app.editWidget', {
        url: '/widget/:widgetId/edit',
        templateUrl: 'modules/widgets/views/widgets.edit.client.view.html',
        authenticationRequired: true,
        accessPermission: 'user'
      })
      .state('app.createWidget', {
        url: '/widgets/create',
        templateUrl: 'modules/widgets/views/widgets.create.client.view.html',
        authenticationRequired: true,
        accessPermission: 'user'
      })
    ;
  }
]);