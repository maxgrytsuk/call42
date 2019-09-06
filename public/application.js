'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName)
  .config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
])
  .config(['$compileProvider',
    function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    }])
  .config(['$translateProvider',
    function($translateProvider) {
      $translateProvider
        .useUrlLoader('/translate')
        .useSanitizeValueStrategy('escaped')
        .useLocalStorage();//fallback to cookie storage
    }])
  .config(['tmhDynamicLocaleProvider',function(tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('/lib/angular-i18n/angular-locale_{{locale}}.js');
  }])
;

//Then define the init function for starting up the application
angular.element(document).ready(function() {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_') window.location.hash = '#!';

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});