'use strict';

angular.module('widgets')
  .directive('workTimeEdit', ['lodash',  function(_) {
    return {
      scope: {
        settings: '='
      },
      templateUrl: 'modules/widgets/views/workTimeEdit.client.view.html'
    };
  }]);