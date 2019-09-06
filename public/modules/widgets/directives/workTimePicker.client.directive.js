'use strict';

angular.module('widgets')
//based on bootstrap timepicker directive
  .controller('WorkTimePickerController', ['$scope', function($scope) {
    var selected,
      ngModelCtrl = { $setViewValue: angular.noop };

    this.init = function( ngModelCtrl_, inputs ) {
      ngModelCtrl = ngModelCtrl_;
      ngModelCtrl.$render = this.render;

      var hoursInputEl = inputs.eq(0),
        minutesInputEl = inputs.eq(1);

      this.setupInputEvents( hoursInputEl, minutesInputEl );
    };

    // Get $scope.hours in 24H mode if valid
    function getHoursFromTemplate ( ) {
      var hours = parseInt( $scope.hours, 10 );
      var valid = hours >= 0 && hours <= 24;
      if ( !valid ) {
        return 0;
      }
      return hours;
    }

    function getMinutesFromTemplate() {
      var minutes = parseInt($scope.minutes, 10);
      var hours = parseInt( $scope.hours, 10 );
      return ( minutes >= 0 && minutes < 60 ) ? (hours === 24?0:minutes) : 0;
    }

    function pad( value ) {
      return ( angular.isDefined(value) && value.toString().length < 2 ) ? '0' + value : value;
    }


    this.setupInputEvents = function( hoursInputEl, minutesInputEl ) {

      var invalidate = function(invalidHours, invalidMinutes) {
        ngModelCtrl.$setViewValue( null );
        ngModelCtrl.$setValidity('time', false);
        if (angular.isDefined(invalidHours)) {
          $scope.invalidHours = invalidHours;
        }
        if (angular.isDefined(invalidMinutes)) {
          $scope.invalidMinutes = invalidMinutes;
        }
      };

      $scope.updateHours = function() {
        var hours = getHoursFromTemplate();

        if ( angular.isDefined(hours) ) {
          selected.hours = hours;
          refresh( 'h' );
        } else {
          invalidate(true);
        }
      };

      hoursInputEl.bind('blur', function(e) {
        if ( !$scope.invalidHours && $scope.hours < 10) {
          $scope.$apply( function() {
            $scope.hours = pad( $scope.hours );
          });
        }
      });

      $scope.updateMinutes = function() {
        var minutes = getMinutesFromTemplate();

        if ( angular.isDefined(minutes) ) {
          selected.minutes = minutes ;
          refresh( 'm' );
        } else {
          invalidate(undefined, true);
        }
      };

      minutesInputEl.bind('blur', function(e) {
        if ( !$scope.invalidMinutes && $scope.minutes < 10 ) {
          $scope.$apply( function() {
            $scope.minutes = pad( $scope.minutes );
          });
        }
      });

    };

    this.render = function() {
      selected = ngModelCtrl.$modelValue;
      makeValid();
      updateTemplate();
    };

    // Call internally when we know that model is valid.
    function refresh( keyboardChange ) {
      makeValid();
      ngModelCtrl.$setViewValue( selected );
      updateTemplate( keyboardChange );
    }

    function makeValid() {
      ngModelCtrl.$setValidity('time', true);
      $scope.invalidHours = false;
      $scope.invalidMinutes = false;
    }

    function updateTemplate( keyboardChange ) {
      var hours = selected.hours, minutes = selected.minutes;

      $scope.hours = keyboardChange === 'h' ? hours : pad(hours);
      $scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
    }

  }])

  .directive('workTimePicker', function () {
    return {
      restrict: 'A',
      require: ['workTimePicker', '?^ngModel'],
      controller:'WorkTimePickerController',
      replace: true,
      scope: {
        'available':'='
      },
      templateUrl: 'workTimePicker.html',
      link: function(scope, element, attrs, ctrls) {
        var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

        if ( ngModelCtrl ) {
          timepickerCtrl.init( ngModelCtrl, element.find('input') );
        }
      }
    };
  });