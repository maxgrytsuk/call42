'use strict';

angular.module('widgets')
    .directive('uniqueAsteriskRoute', ['lodash',function(_) {
    return {
      require: 'ngModel',
      scope: {
        channel: '='
      },
      link: function(scope, elm, attrs, ctrl) {
        var channel = scope.channel, idx;
        ctrl.$validators.uniqueAsteriskRoute = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }
          idx = _.findIndex(channel.nativeParams.routes, function(route) {
            return route.pattern === viewValue;
          });
          return idx === -1?true:false;
        };
      }
    };
  }]);