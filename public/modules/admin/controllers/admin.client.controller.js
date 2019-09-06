'use strict';

angular.module('admin').controller('AdminController',
  ['$scope', '$rootScope', '$timeout', '$state', '$http', '$uibModal','$stateParams',  'Blob', 'Authentication','Timezones', 'CallbackRequestsHelper', 'WidgetsHelper', 'Admin', 'Billing', 'BillingHelper', 'PaginatorHelper', 'lodash',
    function($scope, $rootScope, $timeout, $state, $http, $uibModal, $stateParams, Blob, Authentication, Timezones, CallbackRequestsHelper, WidgetsHelper, Admin, Billing, BillingHelper, PaginatorHelper, _) {
      $scope.authentication = Authentication;

      $scope.notificationsMax = Billing.notificationsMax();

      Billing.standardPrices().$promise
        .then(function(prices) {
          $scope.standardPrices = _.map(prices, function(item) {
            item.price = (item.price / 10000).toFixed(4);
            return item;
          });
        });

      Billing.prices().$promise
        .then(function(prices) {
          $scope.prices = prices;
        });

      $scope.getRates = function() {
        var ratesDate = new Date($scope.ratesDate);
        ratesDate.setHours(0);
        ratesDate.setMinutes(0);
        ratesDate.setSeconds(0);
        Billing.rates({date:ratesDate.getTime()}).$promise
          .then(function(rates) {
            if (rates) {
              $scope.isChoosenRate = checkDateIsCurrent(new Date(rates[0].date), ratesDate);
              $scope.ratesDateFormatted = new Date(rates[0].date).toLocaleDateString();
              $scope.rates = rates;
            }
          });
      };

      function checkDateIsCurrent(returnedDate, ratesDate) {
        return returnedDate.getDate() === ratesDate.getDate()
          && returnedDate.getMonth() === ratesDate.getMonth()
          && returnedDate.getYear() === ratesDate.getYear()
          ;
      }

      $scope.ratesDate = new Date();
      $scope.getRates();

      $timeout(function() {
        $scope.timezones = Timezones.query();
      }, 500);

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.isOpened = !$scope.isOpened;
      };

      $scope.findUsers = function() {
        $timeout(function() {
          Admin.findUsers().$promise
            .then(function(users) {
              $scope.users = users;
            });
        }, 300);
      };

      $rootScope.$on("accrualAdd", function(){
        $scope.findUser();
      });

      $scope.findUser = function() {
        Admin.findUser({ userId: $stateParams.userId}).$promise
          .then(function(user) {
            $scope.userToAdmin = user;
            WidgetsHelper.findWidgets({user:user._id})
              .then(function(widgets) {
                $scope.widgets = widgets;
              });
            Billing.currencies().$promise
              .then(function(currencies) {
                $scope.currencies = currencies;
                $scope.userCurrency = _.find($scope.currencies, function(currency) {
                  return user.currency && currency.name === user.currency.name;
                });
              });
          });
      };

      var userData = {};
      $scope.updateUser = function() {
        var self = this;
        if (!_.isEmpty(userData)) {
          Admin.updateUser({userId:$scope.userToAdmin._id}, userData).$promise
            .then(function() {
              self.findUser();
              $scope.success = true;
              $timeout(function() {
                $scope.success = null;
              }, 1000);
            });
        }
      };

      $scope.setUserData = function(data) {
        userData = _.merge(userData, data);
      };

      $scope.changePassword = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'changePassword.html',
          resolve:{
            user: function () {
              return $scope.userToAdmin;
            }
          },
          controller: function ($scope, $stateParams, user) {
            $scope.user = angular.copy(user);
            $scope.passwordDetails = {userId:user._id};
            // Change user password
            $scope.save = function(isValid) {
              if (isValid) {
                $scope.success = $scope.error = null;

                $http.post('/users/password', $scope.passwordDetails).success(function(response) {
                  // If successful show success message and clear form
                  $scope.success = true;
                  $timeout(function() {
                    modalInstance.close();
                    $scope.passwordDetails = null;
                  }, 500);
                }).error(function(response) {
                  $scope.error = response.message;
                });
              } else {
                $scope.submitted = true;
              }
            };

            $scope.cancel = function () {
              modalInstance.dismiss('cancel');
            };
          }
        });
      };

      $scope.deleteUser = function(userId) {
        var self = this;
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'confirmUserDelete.html',
          controller: function ($scope, $stateParams, userId) {
            $scope.canBeDeleted = false;
            Admin.findUser({ userId: userId}).$promise
              .then(function(user) {
                if (user.roles.indexOf('admin') === -1) {
                  Admin.getUserBalanceCount({ userId: userId}).$promise
                    .then(function(data) {
                      if (data.count) {
                        $scope.text = 'Удаление пользователя невозможно, у пользователя было движение средств';
                      } else {
                        $scope.canBeDeleted = true;
                        $scope.text = 'Все данные пользователя будут удалены';
                      }
                    });
                } else {
                  $scope.text = 'Удаление админ пользователя невозможно';
                }
              });

            $scope.ok = function () {
              Admin.deleteUser({userId:userId}).$promise
                .then(function(data) {
                  if (data.result === 'OK') {
                    $scope.text = 'Пользователь удален';
                    self.findUsers();
                  } else {
                    $scope.text = 'Что-то пошло не так';
                  }
                  $timeout(function() {
                    modalInstance.close();
                  }, 500);
                });
            };

            $scope.cancel = function () {
              modalInstance.dismiss('cancel');
            };
          },
          resolve: {
            userId: function () {
              return userId;
            }
          }
        });
      };

      $scope.loginAsUser = function(userId) {
        Admin.loginAsUser({userId:userId}).$promise
          .then(function(data) {
            $scope.authentication.user = data;
            $state.go('app.dashboard');
          });
      };

      $scope.updatePrices = function() {
        var prices = angular.copy($scope.standardPrices);
        prices = _.map(prices, function(item) {
          item.price = (item.price * 10000).toFixed(0);
          return item;
        });
        Billing.updatePrices(prices, function() {
          $state.go('app.users');
        });
      };

      $scope.downloadLog = function(userId) {
        $http.get('/admin/log/'+userId)
          .success(function (data) {
            if (_.isObject(data) && data.result === 'NOT_EXIST') {
              $scope.logNotExist = true;
              $timeout(function() {
                $scope.logNotExist = false;
              }, 1000);
            } else {
              var blob = new Blob([data.toString()], {
                type: 'text/plain;charset=utf-8'
              });
              var url = URL.createObjectURL(blob);
              var a = document.createElement('a');
              a.download = userId + '.log';
              a.href = url;
              a.textContent = 'Download ' + userId + '.log';
              a.click();
            }
          })
        ;
      };

      $scope.deleteLog = function(userId) {
        var self = this;
        var modalInstance= $uibModal.open({
          animation: true,
          templateUrl: 'confirmLogDelete.html',
          controller: function ($scope, $stateParams, userId) {
            $scope.text = 'Лог пользователя будет удален';
            $scope.ok = function () {
              Admin.deleteLog({userId:userId}).$promise
                .then(function(data) {
                  if (data.result === 'OK') {
                    $scope.text = 'Лог удален';
                    self.findUsers();
                  } else if (data.result === 'NOT_EXIST') {
                    $scope.text = 'Лог файла нет';
                  } else {
                    $scope.text = 'Что-то пошло не так';
                  }
                  $timeout(function() {
                    modalInstance.close();
                  }, 1000);
                });
            };

            $scope.cancel = function () {
              modalInstance.dismiss('cancel');
            };
          },
          resolve: {
            userId: function () {
              return userId;
            }
          }
        });

      };

      $scope.isCurrencyChosen = function(user) {
        return user && (user.money || _.find($scope.balance, function(item){return (item.type === 'ACCRUAL_MONEY' || item.type === 'ACCRUAL_MONEY_LIQPAY');}));
      };

      $scope.createAccrual = function(accrual) {
        if (accrual && accrual.money) {
          accrual.user = $scope.userToAdmin._id;
          if (!accrual.info) {
            accrual.info = {};
          }
          accrual.notifications = 0;
          accrual.money = accrual.money * 10000;
          Billing.createAccrual(accrual).$promise
            .then(function() {
              $scope.accrual = {};
              $rootScope.$broadcast("accrualAdd");
            });
        }
      };

      $scope.formatMoney = function(user, currency) {
        return BillingHelper.formatMoney(user, currency);
      };

      $scope.getPaginatorInfo = function() {
        return PaginatorHelper.getInfo($scope.pagesData);
      };

      $scope.getChannelInfo = function(channel) {
        return CallbackRequestsHelper.getChannelInfo(channel);
      };
    }
  ]);