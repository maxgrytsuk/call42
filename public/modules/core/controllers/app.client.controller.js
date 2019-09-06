'use strict';


angular.module('core').controller('AppController', ['$rootScope','$scope', '$translate', 'tmhDynamicLocale', '$state', '$http', '$window', '$location','Authentication', '$locale',
  function($rootScope, $scope, $translate, tmhDynamicLocale, $state, $http, $window, $location, Authentication) {

    $scope.authentication = Authentication;

    $scope.languages = {'en':'English', 'ru':'Русский'};

    $scope.setLang = function(lang) {

      tmhDynamicLocale.set(lang).then(function() {

        // Set the language in angular-translate
        $translate.use(lang);

        $scope.currentLanguage = $scope.languages[lang];

        // Broadcast the event so datepickers would rerender
        $rootScope.$broadcast('localeChanged', {lang:lang});
      });

    };

    $scope.setLang(Authentication.user.lang);

    $scope.changeLanguage = function(lang){
      $http.post('/users/changeLanguage', {lang:lang}).then(function(){
        Authentication.user.lang = lang;
        $window.widget_id = lang === 'ru'?$window.widget_ru:$window.widget_en;
        if ($window.call42) {
          $window.call42.init();
        }
        $scope.setLang(lang);
      });
    };

    $scope.getIsActiveMenuItem = function(state) {
      return $state.is(state) ? 'active':'';
    };

    $scope.app = {
      name:'Call42',
      settings: {
        asideFolded: false
      }
    };
  }
]);