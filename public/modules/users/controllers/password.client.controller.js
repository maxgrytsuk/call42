'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
  function($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    //If user is signed in then redirect back home
    if ($scope.authentication.user) $location.path('/');
    $scope.inProgress = false;
    // Submit forgotten password account id
    $scope.askForPasswordReset = function() {
      $scope.success = $scope.error = null;
      $scope.inProgress = true;
      $http.post('/auth/forgot', $scope.credentials)
        .success(function(response) {
          processResponse(response, true);
        }).error(function(response) {
          processResponse(response, false);
        });
    };

    function processResponse(response, result) {
      $scope.credentials = null;
      $scope.inProgress = false;
      result?$scope.success = response.message:$scope.error = response.message;
      $scope.translationData = {
        data: response.data
      };
    }

    // Change user password
    $scope.resetUserPassword = function() {
      $scope.success = $scope.error = null;
      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);