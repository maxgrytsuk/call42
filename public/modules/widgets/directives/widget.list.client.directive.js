'use strict';

angular.module('widgets')
  .directive('widgetList', ['lodash', '$uibModal', 'Channels', 'BillingHelper','Billing', function(_, $uibModal, Channels, BillingHelper, Billing) {
    return {
      scope: {
        widgets: '=',
        isAdmin: '@',
        user: '='
      },
      templateUrl: 'modules/widgets/views/widget.list.client.view.html',
      link: function(scope) {

        var rate, price, free = ['email'];
        scope.canBeFree = function(channelType) {
          return free.indexOf(channelType) !== -1;
        };

        function getChannelInfo(channel) {
          var info;
          switch(channel.type) {
            case 'email':
              info = channel.nativeParams.emails;break;
            case 'asterisk':
              info = channel.nativeParams.host + ':' + channel.nativeParams.port;break;
            case 'sms':
              info = channel.nativeParams.phone;break;
            default: info = '';
          }
          return info;
        }

        function getStandardPrice(channelType) {
          rate = _.find(scope.prices, function(rate){
            return rate.notification_type.toLowerCase() === channelType;
          });
          if (rate) {
            return BillingHelper.formatMoney(rate.price, scope.user.currency.name);
          }
          return '';
        }

        scope.getChannelInfo = function(channel) {
          return getChannelInfo(channel);
        };

        scope.editPrice = function(channelSettings) {

          var modalInstance = $uibModal.open({
            animation: true,
            size:'lg',
            templateUrl: 'editPrice.html',
            resolve:{
              channelSettings: function () {
                return channelSettings;
              },
              currency: function () {
                return scope.user.currency.name;
              },
              standardPrice: function() {
                return getStandardPrice(channelSettings.type);
              }
            },
            controller: function ($scope, $stateParams, channelSettings, currency, standardPrice) {

              var channelSettings = angular.copy(channelSettings);
              channelSettings.price = channelSettings.price?(channelSettings.price / 10000).toFixed(4):0;
              $scope.channelSettings = channelSettings;
              $scope.currency= currency;
              $scope.standardPrice= standardPrice;
              $scope.channelInfo = getChannelInfo(channelSettings);

              $scope.save = function (form) {
                if ( form.$valid ) {
                  channelSettings.price = (channelSettings.price * 10000).toFixed(0);
                  Channels.update({}, channelSettings).$promise.then(function() {
                    modalInstance.close();
                    _.forEach(scope.widgets, function(widget) {
                      _.forEach(widget.channels, function(channel) {
                        if (channel.model._id === channelSettings._id) {
                          channel.model.price = channelSettings.price;
                        }
                      })
                    })
                  });
                }
              };

              $scope.cancel = function () {
                modalInstance.dismiss('cancel');
              };
            }
          });

        };

        Billing.prices({user:scope.user._id, currency:scope.user.currency._id}).$promise
          .then(function(data) {
            scope.prices = data;
          });

        scope.getPrice = function(channel) {
          price = channel.price;
          if (price) {
            return BillingHelper.formatMoney(price, scope.user.currency.name);
          }
          return getStandardPrice(channel.type);
        };

      }
    };
  }]);