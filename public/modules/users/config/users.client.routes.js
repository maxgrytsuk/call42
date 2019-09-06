'use strict';

// Setting up route
angular.module('users')
  .config(['$stateProvider','JQ_CONFIG', 'MODULE_CONFIG',
  function($stateProvider, JQ_CONFIG, MODULE_CONFIG) {
    // Users state routing
    $stateProvider.
      state('app.editProfile', {
        url: '/settings/profile/edit',
        templateUrl: 'modules/users/views/settings/edit-profile.client.view.html',
        authenticationRequired: true
      }).
      state('app.profile', {
        url: '/settings/profile',
        templateUrl: 'modules/users/views/settings/profile.client.view.html',
        authenticationRequired: true
      }).
      state('app.password', {
        url: '/settings/password',
        templateUrl: 'modules/users/views/settings/change-password.client.view.html',
        authenticationRequired: true
      }).
      state('app.accounts', {
        url: '/settings/accounts',
        templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
      }).
      state('access', {
        url: '/access',
        template: '<div ui-view class="fade-in-right-big smooth"></div>'
      })
      .state('access.signin', {
        url: '/signin',
        templateUrl: 'modules/users/views/authentication/signin.client.view.html'
      })
      .state('access.signup', {
        url: '/signup',
        templateUrl: 'modules/users/views/authentication/signup.client.view.html'
      }).
      state('forgot', {
        url: '/password/forgot',
        templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
      }).
      state('reset-invalid', {
        url: '/password/reset/invalid',
        templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
      }).
      state('reset-success', {
        url: '/password/reset/success',
        templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
      }).
      state('reset', {
        url: '/password/reset/:token',
        templateUrl: 'modules/users/views/password/reset-password.client.view.html'
      });
  }
]);