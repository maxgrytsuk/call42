'use strict';

angular.module('callbackRequests')
  .factory('CallbackRequests', ['$resource',
    function($resource) {
      return $resource('callbackRequests', {}, {
        query: {
          method:'GET',
          params:{},
          isArray:false
        },
        export: {
          method:'GET',
          url:'callbackRequests/export',
          params:{},
          isArray:false
        },
        count: {
          method:'GET',
          url:'callbackRequests/count',
          params:{},
          isArray:false
        }
      });
    }
  ]);