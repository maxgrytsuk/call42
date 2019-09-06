'use strict';

angular.module('users')
  .factory('UsersHelper',['Users', 'lodash', '$translate', function(Users) {

    return {
      createUser:function(user){
        return new Users(user);
      },
      findMe:function(){
        return Users.me().$promise;
      }
   };
  }]);