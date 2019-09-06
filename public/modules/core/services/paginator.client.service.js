'use strict';

angular.module('core')
  .factory('PaginatorHelper',['lodash', function(_) {
   var first, last, info;
    return {
      getInfo:function(data) {
        info = '';
        if (data && data.count) {
          first = data.options.perPage * (data.current - 1) + 1;
          if (data.current !== data.last) {
            last = first + parseInt(data.options.perPage) - 1;
          } else {
            last = data.count;
          }
          if (first !== last) {
            info = '( ' + first + ' - ' + last + ' ) / ' + data.count;
          } else {
            info = first + '/' + data.count;
          }
        }
        return info;
      }
    };
  }]);