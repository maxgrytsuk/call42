'use strict';

var EMAIL_REGEXP = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
angular.module('core')
  .directive('emails', ['lodash', '$q', '$timeout', function(_, $q, $timeout) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {

        ctrl.$asyncValidators.invalidEmailListFormat = function(modelValue, viewValue) {

          if (ctrl.$isEmpty(modelValue)) {
            // consider empty model valid
            return $q.when();
          }

          var def = $q.defer(), result = true,
            emails = viewValue.split(',');

          $timeout(function() {

            _.forEach(emails, function(email) {
              if (!EMAIL_REGEXP.test(email.trim())) {
                result = false;
              }
            });

            if (result) {
              def.resolve();
            } else {
              def.reject();
            }

          });

          return def.promise;
        };
      }
    };
  }]);