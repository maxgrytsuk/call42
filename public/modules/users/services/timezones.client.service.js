'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Timezones', ['$resource',
  function($resource) {
    return $resource('/timezones');
  }
]);