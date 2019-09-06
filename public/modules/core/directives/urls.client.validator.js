'use strict';

var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
angular.module('core').directive('urls', ['lodash',function(_) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.urls = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }
        var result = true,
          urls = viewValue.split(',');

        _.forEach(urls, function(url) {
          if (!URL_REGEXP.test(url.trim())) {
            result = false;
          }
        });
        return result;
      };
    }
  };
}]);