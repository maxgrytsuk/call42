'use strict';

angular.module('users').controller('SettingsController',
  ['$scope', '$http', '$location', '$timeout', '$uibModal', '$translate', 'lodash', 'UsersHelper', 'CallbackRequestsHelper', 'BillingHelper', 'PaginatorHelper', 'Authentication', 'Timezones',
    function($scope, $http, $location, $timeout, $uibModal, $translate, _, UsersHelper, CallbackRequestsHelper, BillingHelper, PaginatorHelper, Authentication, Timezones) {

      var self = this;
      this.findMe = function() {
        UsersHelper.findMe()
          .then(function(user) {
            $scope.user = user;
          });
      };

      this.findMe();

      $scope.getPaginatorInfo = function() {
        return PaginatorHelper.getInfo($scope.pagesData);
      };

      $scope.getChannelInfo = function(channel) {
        return CallbackRequestsHelper.getChannelInfo(channel);
      };

      $scope.formatMoney = function(user, currency) {
        return BillingHelper.formatMoney(user, currency);
      };

      $scope.editProfile = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'editProfile.html',
          resolve:{
            user: function () {
              return $scope.user;
            }
          },
          controller: function ($scope, $stateParams, user) {
            $scope.user = angular.copy(user);
            $scope.timezones = [];
            $timeout(function() {
              $scope.timezones = Timezones.query();
            }, 500);
            $scope.save = function (isValid) {
              if (isValid) {
                $scope.success = $scope.error = null;
                var user = UsersHelper.createUser($scope.user);
                user.$update(function(response) {
                  $scope.success = true;
                  Authentication.user = response;
                  self.findMe();
                  $timeout(function() {
                    modalInstance.close();
                  }, 500);
                }, function(response) {
                  $translate(response.data.message).then(function(v){
                    $scope.error = v;
                  });
                });
              } else {
                $scope.submitted = true;
              }
            };

            $scope.cancel = function () {
              modalInstance.dismiss('cancel');
            };
          }
        });
      };

      $scope.changePassword = function() {
        var modalInstance= $uibModal.open({
          animation: true,
          templateUrl: 'changePassword.html',
          resolve:{
            user: function () {
              return $scope.user;
            }
          },
          controller: function ($scope, $stateParams, user) {
            $scope.user = angular.copy(user);
            $scope.passwordDetails = {};
            // Change user password
            $scope.save = function(isValid) {
              if (isValid) {
                $scope.success = $scope.error = null;

                $http.post('/users/password', $scope.passwordDetails).success(function(response) {
                  // If successful show success message and clear form
                  $scope.success = true;
                  $timeout(function() {
                    modalInstance.close();
                    $scope.passwordDetails = null;
                  }, 500);
                }).error(function(response) {
                  $translate(response.message).then(function(v){
                    $scope.error = v;
                  });
                });
              } else {
                $scope.submitted = true;
              }
            };

            $scope.cancel = function () {
              modalInstance.dismiss('cancel');
            };
          }
        });
      };
    }
  ]);