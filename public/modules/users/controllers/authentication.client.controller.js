'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$window', '$state', '$translate', 'Authentication',
  function($scope, $http, $window, $state, $translate, Authentication) {
    $scope.authentication = Authentication;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) $state.go('/');

    $scope.signup = function() {
      $http.post('/auth/signup', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        $scope.setLang();
        if ($window.ga) {
          $window.ga('set', 'page', '/welcome');
          $window.ga('send', 'pageview');
        }
        // And redirect to the welcome page
        $window.location.href = $window.location.origin + '/app#!welcome';
        $window.location.reload();
      }).error(function(response) {
        $scope.error = response.message;
        $translate(response.message).then(function(v){
          $scope.error = v;
        });
      });
    };

    $scope.signin = function() {
      $http.post('/auth/signin', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        $scope.setLang();
        if ($scope.authentication.user.username === 'admin') {
          $window.location.href = $window.location.origin + '/app#!users';
        } else {
          if ($window.ga) {
            $window.ga('set', 'page', '/start');
            $window.ga('send', 'pageview');
          }
          // And redirect to the start page
          $window.location.href = $window.location.origin + '/app#!start';
        }
        $window.location.reload();
      }).error(function(response) {
        $scope.error = response.message;
        $translate(response.message).then(function(v){
          $scope.error = v;
        });
      });
    };

    $scope.closeAlert = function() {
      $scope.error = '';
    };
    $scope.closeAgreeAlert = function() {
      $scope.agreeError = '';
    };

  }
]);