'use strict';

angular.module('widgets')
  .factory('Widgets', ['$resource',
    function($resource) {
      return $resource('widgets/:widgetId', {
        widgetId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }
  ])
  .factory('Channels', ['$resource',
    function($resource) {
      return $resource('channels/:channelId', {
        channelId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }
  ]);