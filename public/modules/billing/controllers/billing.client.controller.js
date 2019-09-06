'use strict';

angular.module('billing').controller('BillingController',
  ['$scope', '$http', '$timeout', '$sce', '$state', '$translate','$stateParams', 'Authentication', 'UsersHelper', 'Billing', 'BillingHelper', 'lodash',
    function($scope, $http, $timeout, $sce, $state, $translate, $stateParams, Authentication,  UsersHelper,   Billing, BillingHelper, _) {

      $scope.user =  Authentication.user;
      $scope.isAdmin = Authentication.user.username === 'admin';

      $scope.getLiqPayFormData = function() {
        $scope.liqPay = null;
        if ($scope.payment.amount) {
          Billing.getPaymentData({amount:$scope.payment.amount}).$promise.then(
            function(data) {
              $scope.liqPay = data;
            }
          );
        }
      };

      $scope.prices = [];
      var canBeFree, idx, name;
      Billing.prices().$promise
        .then(function(prices) {
          _.forEach(prices, function(item) {
            if ( $scope.user && item.currency.name === $scope.user.currency.name) {
              canBeFree = item.notification_type === 'EMAIL';
              idx = item.notification_type === 'EMAIL'? 0:1;
              name = item.notification_type;
              if (item.param){
                name = name + ' (' + item.param + ')';
              }
              $scope.prices.push(
                {idx:idx, name:name, canBeFree:canBeFree, price:BillingHelper.formatMoney(item.price, item.currency.name)}
              );
            }
          });
        });

      Billing.currencies().$promise
        .then(function(currencies) {
          $scope.currencies = currencies;
          $scope.userCurrency = _.find($scope.currencies, function (currency) {
            return $scope.user && $scope.user.currency && currency.name === $scope.user.currency.name;
          });
        });

      $scope.setUserCurrency = function(currency) {
        $scope.user.currency = currency.id;
        var user = UsersHelper.createUser($scope.user);
        user.$update(function(response) {
          $scope.success = true;
          Authentication.user = response;
          $scope.user = Authentication.user;
        }, function(response) {
          $translate(response.data.message).then(function(v){
            $scope.error = v;
          });
        });
      };

      $scope.isCurrencyChosen = function(user) {
        return user && (!_.isUndefined(user.money));
      };

      $scope.onPay = function() {
        Billing.pay({orderId:$scope.liqPay.orderId, service:'liqPay', amount:$scope.payment.amount});
      };

      $scope.formatMoney = function(money, currency) {
        return BillingHelper.formatMoney(money, currency);
      };
    }
  ]);