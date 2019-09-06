'use strict';

angular.module('callbackRequests')
  .factory('CallbackRequestsHelper',['CallbackRequests', 'Widgets', 'BillingHelper','lodash', function(CallbackRequests, Widgets, BillingHelper, _) {
    var colorStyle,
      inactiveChannelCodes =
        [
          'STATUS_BEYOND_WORK_TIME',
          'STATUS_CHANNEL_DISABLED',
          'STATUS_NO_ACTIVE_PEERS',
          'STATUS_NO_SEND_IF_SUCCESS'
        ];
    return {
      getColorStyle : function(notification) {
        colorStyle = {'color':'green'};
        if (!notification.success) {
          colorStyle.color = 'red';
          if (inactiveChannelCodes.indexOf(notification.info.code) !== -1) {
            colorStyle.color ='rgb(200,200,200)';
          }
        }
        return colorStyle;
      },
      getNotificationCost : function(notification, currency) {
        var result = '-', free, money;
        if (notification.balance) {
          _.forEach(notification.balance, function(item) {
            if (item.free) {
              free = free?free += item.free:item.free;
            } else if (item.money) {
              money = money?money += item.money:item.money;
            }
          });
        }
        if (free === -1) {
          result = '1 free';
        } if (free === 0) {
          result = BillingHelper.formatMoney(free, currency);
        } else if (_.isNumber(money)) {
          result = BillingHelper.formatMoney(Math.abs(money), currency);
        }
        return result;
      },
      findCallbackRequests: function(params) {
        return CallbackRequests.query(params).$promise;
      },
      getCallbackRequestsCount: function(params) {
        return CallbackRequests.count(params).$promise;
      },
      getDataForExport:function(params) {
        return CallbackRequests.export(params).$promise;
      },
      getChannelInfo: function(channelData) {
        return channelData.info?'(' + channelData.info + ')':'';
      }
    };
  }]);