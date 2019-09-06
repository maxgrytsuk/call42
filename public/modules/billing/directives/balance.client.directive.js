'use strict';

angular.module('billing')
  .directive('balance', ['$rootScope', 'lodash', 'BillingHelper','PaginatorHelper', function($rootScope, _, BillingHelper, PaginatorHelper) {
    return {
      scope: {
        userId: '=',
        currency: '=',
        isAdmin:'@'
      },
      templateUrl: 'modules/billing/views/balance.client.view.html',
      link: function(scope, elem, attrs) {

        scope.loading = false;
        scope.getBalance = function(spec) {
          scope.loading = true;
          var page = spec && spec.page?spec.page:1;
          BillingHelper.getBalance({userId: scope.userId, page: page, perPage:100, from:scope.from, to:scope.to})
            .then(function(data) {
              scope.balance = data.results;
              scope.pagesData = data;
              scope.pagesData.perPage = parseInt(data.options.perPage);
              scope.loading = false;
            });
        };

        scope.getPaginatorInfo = function() {
          return PaginatorHelper.getInfo(scope.pagesData);
        };

        var totalAmount, totalCost;
        scope.getTotal = function() {
          BillingHelper.getTotal({userId: scope.userId, from:scope.from, to:scope.to})
            .then(function(data) {
              totalAmount = data.totalAmount?Math.abs(data.totalAmount):0;
              totalCost = data.totalCost?data.totalCost:0;
              scope.totalAmount = BillingHelper.formatMoney(totalAmount, scope.currency);
              scope.totalCost = BillingHelper.formatMoney(totalCost, scope.currency);
            });
        };
        $rootScope.$on('localeChanged', function(e, data) {
          scope.dateOptions.startingDay = data.lang === 'en'?0:1;
        });
        scope.dateOptions = {};

        scope.getData = function() {
          scope.getBalance();
          scope.getTotal();
        };

        scope.getData();

        $rootScope.$on("accrualAdd", function(){
          scope.getData();
        });

        scope.open = function($event, input) {
          $event.preventDefault();
          $event.stopPropagation();

          input === 'from'?scope.fromOpened = true:scope.toOpened = true;
        };

      }
    };
  }]);