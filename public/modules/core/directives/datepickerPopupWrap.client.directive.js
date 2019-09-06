angular
  .module('core')
  .directive('datepickerPopupWrap', datepickerPopupWrap);

datepickerPopupWrap.$inject = ['$rootScope'];

function datepickerPopupWrap($rootScope, $compile) {

  return {

    restrict: 'A',
    require: 'ngModel',

    link: function($scope, $element, attrs, ngModel) {
      // Force popup rerender whenever locale changes
      $rootScope.$on('localeChanged', ngModel.$render);
    }
  };

}