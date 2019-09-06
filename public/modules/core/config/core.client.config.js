'use strict';

angular.module('core')
  .run([
    '$rootScope', '$state', '$translate', '$http', '$location', '$window', 'Authentication',
    function ($rootScope, $state, $translate, $http, $location, $window, Authentication) {

      $rootScope.$on('$stateChangeStart',
        function (event, toState) {
          if(Authentication.user) {
            var isAdmin = Authentication.user.username === 'admin';
            if (toState.name.indexOf('access') !== -1) {//user is authenticated, trying to access signin or signup page, should be redirected to default page
              event.preventDefault();
              if (isAdmin) {
                $state.go('app.users');
              } else {
                $state.go('app.dashboard');
              }
            } else if (!isAdmin && toState.accessPermission === 'admin' && toState.name !== 'app.dashboard') {//user tries to access some admin page
              event.preventDefault();
              $state.go('app.dashboard');
            } else if (isAdmin && toState.accessPermission === 'user' && toState.name !== 'app.users') {//admin tries to access some user's page
              event.preventDefault();
              $state.go('app.users');
            }
          } else if (toState.authenticationRequired) {
              event.preventDefault();
              $state.go('access.signin');
          }
        }
      );

      $rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams) {
          if (toState.name === 'access.signin' || toState.name === 'access.signup') {
            var lang = $location.search().lang;
            if (lang) {
              $translate.use(lang);
            }
          }
          $window.scroll(0,0);
        }
      );
    }
  ]);
