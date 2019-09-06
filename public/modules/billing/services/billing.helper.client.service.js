'use strict';

angular.module('admin')
  .factory('BillingHelper',['Billing', 'lodash', function(Billing, _) {

    return {
      formatMoney : function(money, currency) {
        if (!_.isUndefined(money)) {
          currency = _.isUndefined(currency)?'':currency;
          return (money/10000).toFixed(4) + '&nbsp;' + currency;
        }
        return '';
      },
      getTotal:function(spec) {
        return Billing.getTotal(spec).$promise;
      },
      getBalance:function(spec) {
        return Billing.balance(spec).$promise;
      }
    };
  }]);