'use strict';

(function() {
  // Authentication controller Spec
  describe('AuthenticationController', function() {
    // Initialize global variables
    var AuthenticationController,
      scope,
      $httpBackend,
      $stateParams,
      $templateCache,
      $location;

    beforeEach(function() {
      jasmine.addMatchers({
        toEqualData: function(util, customEqualityTesters) {
          return {
            compare: function(actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Load the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _$templateCache_) {
      // Set a new global scope
      scope = $rootScope.$new();
      scope.setLang = function(){};

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $templateCache = _$templateCache_;

      $templateCache.put('modules/core/views/home.client.view.html', '.<template-goes-here />');
      $templateCache.put('modules/widgets/views/widgets.list.client.view.html', '.<template-goes-here />');
      $templateCache.put('modules/core/views/app.client.view.html', '.<template-goes-here />');
      $templateCache.put('modules/dashboard/views/dashboard.client.view.html', '.<template-goes-here />');
      $templateCache.put('modules/users/views/authentication/signin.client.view.html', '.<template-goes-here />');
      // Initialize the Authentication controller
      AuthenticationController = $controller('AuthenticationController', {
        $scope: scope
      });
      $httpBackend.when('GET', '/translate?lang=en').respond(200, 'test');
      $httpBackend.when('GET', '/translate?lang=undefined').respond(200, 'test');
      $httpBackend.when('GET', '/detectLanguage').respond(200, 'test');
      $httpBackend.when('GET', 'callbackRequests/report').respond(200, []);
      $httpBackend.when('POST', '/users/changeLanguage').respond(200);
    }));


    it('$scope.signin() should login with a correct user and password', function() {
      // Test expected GET request
      $httpBackend.when('POST', '/auth/signin').respond(200, 'Fred');

      scope.signin();
      $httpBackend.flush();

      // Test scope value
      expect(scope.authentication.user).toEqual('Fred');
      //expect($location.url()).toEqual('/');
    });

    it('$scope.signin() should fail to log in with nothing', function() {
      // Test expected POST request
      $httpBackend.expectPOST('/auth/signin').respond(400, {
        'message': 'Missing credentials'
      });

      scope.signin();
      $httpBackend.flush();

      // Test scope value
      expect(scope.error).toEqual('Missing credentials');
    });

    it('$scope.signin() should fail to log in with wrong credentials', function() {
      // Foo/Bar combo assumed to not exist
      scope.authentication.user = 'Foo';
      scope.credentials = 'Bar';

      // Test expected POST request
      $httpBackend.expectPOST('/auth/signin').respond(400, {
        'message': 'Unknown user'
      });

      scope.signin();
      $httpBackend.flush();

      // Test scope value
      expect(scope.error).toEqual('Unknown user');
    });

    it('$scope.signup() should register with correct data', function() {
      // Test expected GET request
      scope.authentication.user = 'Fred';
      $httpBackend.when('POST', '/auth/signup').respond(200, 'Fred');

      scope.signup();
      $httpBackend.flush();

      // test scope value
      expect(scope.authentication.user).toBe('Fred');
      expect(scope.error).toEqual(undefined);
      expect($location.url()).toBe('/');
    });

    it('$scope.signup() should fail to register with duplicate Username', function() {
      // Test expected POST request
      $httpBackend.when('POST', '/auth/signup').respond(400, {
        'message': 'Username already exists'
      });
      scope.agree = true;
      scope.signup();
      $httpBackend.flush();

      // Test scope value
      expect(scope.error).toBe('Username already exists');
    });
  });
}());