'use strict';

/* Controllers */
angular.module('dashboard')
  .controller('DashboardCtrl',
  ['$scope', '$rootScope', '$translate', 'WidgetsHelper', 'DashboardHelper', 'CallbackRequestsHelper',
    function($scope, $rootScope, $translate,  WidgetsHelper, DashboardHelper, CallbackRequestsHelper) {

      CallbackRequestsHelper.findCallbackRequests({sort:'created', period: 29 * 24 * 60 * 60})
        .then(function(data){
          $scope.callbackRequests = data.results;
          $scope.lastCallbackRequests = DashboardHelper.getLastCallbackRequests({callbackRequests:$scope.callbackRequests, count: 10});
          return WidgetsHelper.findWidgets();
        })
        .then(function(widgets) {
          DashboardHelper.setCallbackRequestsToWidgets(widgets, $scope.callbackRequests);
          $scope.widgets = widgets;

          if (!widgets.length) {
            $scope.emptyText = 'VIEW_WIDGETS_EMPTY_TEXT';
          }
          if ($scope.callbackRequests.length) {
            setChartData();
          }
        });

      var chartsData;
      function setChartData() {
        $translate([
          'VIEW_DASHBOARD_LABEL_ALL_CALLBACK_REQUESTS',
          'VIEW_DASHBOARD_LABEL_FAILED_CALLBACK_REQUESTS',
          'VIEW_DASHBOARD_CHART_TOOLTIP'
        ])
          .then(function (translations) {
            $scope.chartTexts = {
              labelAllCallbackRequestsText :translations.VIEW_DASHBOARD_LABEL_ALL_CALLBACK_REQUESTS,
              labelFailedCallbackRequestsText :translations.VIEW_DASHBOARD_LABEL_FAILED_CALLBACK_REQUESTS,
              tooltipText :translations.VIEW_DASHBOARD_CHART_TOOLTIP
            };
            if ($scope.callbackRequests.length) {
              chartsData = DashboardHelper.getChartsData({callbackRequests:$scope.callbackRequests, widgets:$scope.widgets, chartTexts:$scope.chartTexts});
              $scope.chartsData = chartsData.data;

              $scope.chartOptions = {
                legend: {
                  noColumns:2,
                  position:'nw',
                  margin: [0, -23]
                },
                colors: [ '#23b7e5', 'rgb(226,64,5)'],
                series: { shadowSize: 3 },
                xaxis:{
                  font: { color: '#ccc' },
                  position: 'bottom',
                  ticks:chartsData.ticks,
                  max:31,
                  timeformat: '%d-%m'
                },
                yaxis:{
                  font: { color: '#ccc' },
                  tickDecimals: 0
                },
                grid: { hoverable: true, clickable: true, borderWidth: 0, color: '#ccc' },
                tooltip: true,
                tooltipOpts: {
                  content:  '%s : %y ',
                  defaultTheme: false,
                  shifts: { x: 0, y: -30 }
                }
              };
            }

          });
      }

      $scope.getColorStyle = function(notification) {
        return CallbackRequestsHelper.getColorStyle(notification);
      };

    }]);