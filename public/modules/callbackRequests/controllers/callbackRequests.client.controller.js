'use strict';

angular.module('callbackRequests').controller('CallbackRequestsController',
  ['$scope',  '$location', '$window', '$document', '$timeout', 'CallbackRequestsHelper', 'PaginatorHelper', 'WidgetsHelper', 'Authentication', 'lodash',
    function($scope, $location, $window, $document, $timeout, CallbackRequestsHelper, PaginatorHelper, WidgetsHelper, Authentication, _) {

      var user = Authentication.user;
      $scope.phone = '';
      $scope.channelNames = [];
      $scope.widgets = [{name:'VIEW_CALLBACK_REQUESTS_ALL_WIDGETS', value:'all'}];

      var currentWidgetIdx;
      if (!$scope.currentWidgetName) {
        $scope.currentWidgetName = $scope.widgets[0].name;
      }

      WidgetsHelper.findWidgets()
        .then( function(widgets) {
          _.forEach(widgets, function(widget) {
            $scope.widgets.push({id:widget._id, name:widget.name, value:widget.name});
          });
          currentWidgetIdx = _.findIndex($scope.widgets, function(widget) {
            return widget.name === $scope.currentWidgetName;
          });
          if (currentWidgetIdx === -1) {
            currentWidgetIdx = 0;
          }
          $scope.currentWidget = $scope.widgets[currentWidgetIdx];
          $timeout(function() {
            $scope.find();
          }, 300);
        });

      var daySec = 24 * 60 * 60;
      $scope.periods = [
        {name:'VIEW_CALLBACK_REQUESTS_TODAY', value: daySec, code:'today'},
        {name:'VIEW_CALLBACK_REQUESTS_WEEK', value:7 * daySec, code: 'week'},
        {name:'VIEW_CALLBACK_REQUESTS_MONTH', value: 30 * daySec, code: 'month'},
        {name:'VIEW_CALLBACK_REQUESTS_YEAR', value:365 * daySec, code:'year'},
        {name:'VIEW_CALLBACK_REQUESTS_ALL', value:null, code:'all'}
      ];
      $scope.currentPeriod = $scope.periods[0];

      $scope.statuses = [
        {name:'VIEW_CALLBACK_REQUESTS_ALL', value:null},
        {name:'VIEW_CALLBACK_REQUESTS_STATUSES_SUCCESS', value:'success'},
        {name:'VIEW_CALLBACK_REQUESTS_STATUSES_FAILURE', value:'failure'}
      ];
      $scope.currentStatus = $scope.statuses[0]; //all

      $scope.toggleCollapsed = function(callbackRequest) {
        if (callbackRequest.isExpanded) {
          callbackRequest.isExpanded = false;
        } else {
          callbackRequest.isExpanded = true;
        }
      };

      $scope.isExpanded = function(callbackRequest) {
        return callbackRequest.isExpanded;
      };

      $scope.getColorStyle = function(notification) {
        return CallbackRequestsHelper.getColorStyle(notification);
      };

      $scope.getNotificationCost = function(notification) {
        return CallbackRequestsHelper.getNotificationCost(notification, user.currency?user.currency.name:'');
      };

      $scope.loading = false;
      $scope.find = function(page) {
        $scope.loading = true;
        CallbackRequestsHelper.findCallbackRequests(getParams({page:page, perPage:50}))
          .then(function(data){
            $scope.callbackRequests = data.results;
            $scope.pagesData = data;
            $scope.pagesData.perPage = parseInt(data.options.perPage);
            $window.scroll(0,0);
            $scope.loading = false;
          });
      };

      $scope.export = function() {
        CallbackRequestsHelper.getDataForExport(getParams({}))
          .then(function(result){
            var data = result.data;
            var charset = 'utf-8';
            var blob = new Blob([data], {
              type: 'text/json;charset='+ charset + ';'
            });

            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', window.URL.createObjectURL(blob));
            downloadLink.attr('download', 'callbackRequests.json');
            downloadLink.attr('target', '_blank');

            $document.find('body').append(downloadLink);
            $timeout(function () {
              downloadLink[0].click();
              downloadLink.remove();
            }, null);
        });
      };

      function getParams(params) {
        return _.merge(params, {
          widget:$scope.currentWidget,
          phone:$scope.phone,
          period:$scope.currentPeriod.value,
          status:$scope.currentStatus.value
        });
      }

      $scope.channelName = function(channel) {
        return channel.name;
      };

      $scope.getChannelInfo = function(channel) {
        return CallbackRequestsHelper.getChannelInfo(channel);
      };

      $scope.getPaginatorInfo = function() {
        return PaginatorHelper.getInfo($scope.pagesData);
      };
    }
  ]);