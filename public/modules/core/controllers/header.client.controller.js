'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$translate', '$window', 'Authentication',
  function($scope, $translate, $window, Authentication) {
    $scope.authentication = Authentication;

    $scope.signout = function() {
      //var lang = $translate.storage().get($translate.storageKey());
      //var href = 'auth/signout';
      //if (lang) {
      //  href += '?lang=' +lang;
      //}
      $window.location.href = 'auth/signout?lang=' + Authentication.user.lang;
      //$window.location.href = href;
    };
  }
]);