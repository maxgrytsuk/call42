'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function($resource) {
    return $resource('users/:userId', {
      userId:'@_id'
    }, {
      update: {
        method: 'PUT'
      },
      delete: {
        method: 'DELETE'
      },
      me: {
        method:'GET',
        url:'/users/me',
        params:{},
        isArray:false
      }
    });
  }
]);