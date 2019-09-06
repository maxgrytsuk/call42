'use strict';

// Admin service used for communicating with the admin REST endpoint
angular.module('admin').factory('Admin', ['$resource',
  function($resource) {
    return $resource('admin', {}, {
      updateUser: {
        url:'admin/users/:userId',
        method: 'PUT'
      },
      findUser: {
        url:'admin/users/:userId',
        method: 'GET'
      },
      findUsers: {
        url:'admin/users',
        method: 'GET',
        isArray:true
      },
      getUserBalanceCount: {
        url:'admin/users/:userId/balance/count',
        method: 'GET',
        isArray:false
      },
      deleteUser: {
        url:'admin/users/:userId',
        method: 'DELETE'
      },
      loginAsUser: {
        url:'admin/loginAsUser/:userId',
        method: 'GET'
      },
      deleteLog: {
        url:'admin/log/:userId',
        method: 'DELETE'
      }
    });
  }
]);