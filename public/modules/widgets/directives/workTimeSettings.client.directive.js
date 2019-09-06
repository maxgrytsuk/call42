'use strict';

angular.module('widgets')
  .directive('workTimeSettings', ['lodash','$uibModal', 'WidgetsHelper', 'Channels', function(_, $uibModal, WidgetsHelper, Channels) {
    return {
      scope: {
        settings: '=',
        model:'=',
        onUpdate: '&'
      },
      templateUrl: 'modules/widgets/views/workTimeSettings.client.view.html',
      link: function(scope) {

        scope.formatTime = function(time) {
          return WidgetsHelper.formatTime(time);
        };

        scope.isRoundTheClock = function(settings) {
          return WidgetsHelper.isRoundTheClock(settings);
        };

        scope.isNotAvailable = function(settings) {
          return !settings.available;
        };

        scope.isWorkingHoursPresent = function(settings) {
          return WidgetsHelper.isWorkingHoursPresent(settings);
        };

        scope.editWorkTimeSettings = function(model, settings) {
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'workTimeSettingsEditDialog.html',
            resolve:{
              model: function () {
                return model;
              },
              settings: function () {
                return settings;
              }
            },
            controller: function ($scope, $stateParams, model, settings) {
              $scope.model = angular.copy(model);
              $scope.settings = angular.copy(settings);
              $scope.getModelInfo = function(model) {
                return WidgetsHelper.getChannelInfo(model);
              };
              $scope.save = function () {
                if ($scope.model.type) {
                  $scope.model.workTime = $scope.settings;
                  Channels.update({}, $scope.model).$promise
                    .then(function() {
                      modalInstance.close();
                      scope.onUpdate();
                    });
                } else {
                  $scope.model.public.auto_invitation.workTime = $scope.settings;
                  WidgetsHelper.updateWidget($scope.model)
                    .then(function() {
                      modalInstance.close();
                      scope.onUpdate();
                    });
                }
              };
              $scope.cancel = function () {
                modalInstance.dismiss('cancel');
              };
            }
          });
        };
      }
    };
  }]);