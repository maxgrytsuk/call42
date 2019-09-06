'use strict';

angular.module('widgets')
  .controller('WidgetsController',
  ['$scope', '$stateParams', '$state', '$location', '$translate', '$http', '$q', '$timeout', '$uibModal', 'Authentication', 'CallbackRequestsHelper', 'Channels', 'WidgetsHelper', 'lodash',
    function($scope, $stateParams, $state, $location, $translate, $http, $q, $timeout, $uibModal, Authentication, CallbackRequestsHelper, Channels, WidgetsHelper, _) {

      var self = this;
      $scope.authentication = Authentication;

      $scope.isDialogTextsCollapsed = true;
      $scope.isWidgetCodeCollapsed = true;

      $scope.channelTypes = ['email','asterisk', 'sms'];

      $scope.findWidgets = function() {
        self.findWidgets();
      };

      $scope.findWidget = function() {
        self.findWidget();
      };

      $scope.createWidget = function() {
        WidgetsHelper.createWidget($scope.widget)
          .then(function(widget) {
            $state.go('app.editWidget',{widgetId:widget._id});
          }
        );
      };

      $scope.updateWidget = function(isValid) {
        if (isValid) {
          WidgetsHelper.updateWidget($scope.widget)
            .then(function() {
              $state.go('app.listWidgets');
            });
        }
      };

      $scope.updateChannel = function(channel) {
        Channels.update({}, channel);
      };

      $scope.deleteWidget = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'confirmWidgetDelete.html',
          resolve:{
            widget: function () {
              return $scope.widget;
            }
          },
          controller: function ($scope, $stateParams, widget) {
            $scope.ok = function () {
              WidgetsHelper.deleteWidget(widget)
                .then(function () {
                  modalInstance.close();
                  $state.go('app.listWidgets');
                  self.findWidgets();
                }
              );
            };

            $scope.cancel = function () {
              modalInstance.dismiss('cancel');
            };
          }
        });
      };

      $scope.findChannel = function() {
        WidgetsHelper.findChannel($stateParams.channelId)
          .then(function(channel) {
            channel.workTime = JSON.stringify(channel.workTime, null, 2);
            $scope.channel = channel;
          });
      };

      $scope.editChannel = function(channel) {
        self.openChannelForm({
          mode:'edit',
          channel:channel
        });
      };

      function detectPhonePrefix() {
        var deferred = $q.defer();
        var phoneCode = '+12345678901';
        $http.get('/phoneCode').then(function(res) {
          phoneCode = res.data.phoneCode?res.data.phoneCode:phoneCode;
        }).finally(function() {
          $translate('VIEW_CHANNEL_EDIT_SMS_PHONE_PLACEHOLDER', {phoneCode:phoneCode})
            .then(function(text) {
              deferred.resolve(text);
            });
        });
        return deferred.promise;
      }

      $scope.addChannel = function() {
        var channelType = $scope.selectedChannelType;
        if (channelType) {
          $q.when(channelType === 'sms'? detectPhonePrefix(): null)
            .then(function (phoneCodeText) {
              self.openChannelForm({
                mode:'create',
                phoneCodeText:phoneCodeText,
                channel:{idx:$scope.widget.channels.length, model:{type:channelType, nativeParams:{callMethod:'1'}}}
              });
            });
        }
      };

      var modalInstanceChannel, modalInstanceDelete, modalInstanceAddRoute;
      this.openChannelForm = function(spec) {
        modalInstanceChannel = $uibModal.open({
          animation: true,
          size:'lg',
          templateUrl: spec.mode +'Channel.html',
          resolve:{
            widget: function () {
              return $scope.widget;
            },
            channel: function () {
              return spec.channel;
            },
            mode: function () {
              return spec.mode;
            },
            phoneCodeText: function () {
              return spec.phoneCodeText;
            }
          },
          controller: function ($scope, $stateParams, widget, channel, mode, phoneCodeText) {
            $translate(['VIEW_CHANNEL_EDIT_ASTERISK_ROUTES_PREFIX_DESCRIPTION', 'VIEW_CHANNEL_EDIT_ASTERISK_ROUTES_PATTERN_DESCRIPTION']).then(function (texts) {
              $scope.asteriskPrefixDescription = texts.VIEW_CHANNEL_EDIT_ASTERISK_ROUTES_PREFIX_DESCRIPTION;
              $scope.asteriskPatternDescription = texts.VIEW_CHANNEL_EDIT_ASTERISK_ROUTES_PATTERN_DESCRIPTION;
            });
            $scope.phoneCodeText = phoneCodeText;
            $scope.channel = angular.copy(channel.model);
            $scope.mode = mode;
            $scope.fakePassword = '******************';
            if (mode === 'create') {
              $scope.channel.idWidget = widget._id;
              $scope.channel.name = $scope.channel.type;
            } else {
              $scope.channel.nativeParams.secret = $scope.fakePassword;
            }
            $scope.getTemplateName = function() {
              return 'modules/widgets/views/channel.' + $scope.channel.type + '.form.client.view.html';
            };
            $scope.delete = function() {
              modalInstanceDelete = $uibModal.open({
                animation: true,
                templateUrl: 'confirmChannelDelete.html',
                resolve:{
                  channel: function () {
                    return channel;
                  }
                },
                controller: function ($scope, $stateParams, channel) {
                  $scope.ok = function () {
                    Channels.delete({channelIdx:channel.idx}, channel.model).$promise
                      .then(function () {
                        self.findWidget();
                        modalInstanceDelete.close();
                        modalInstanceChannel.close();
                      });
                  };
                  $scope.cancel = function () {
                    modalInstanceDelete.dismiss('cancel');
                  };
                }
              });
            };

            $scope.clearAsteriskPassword = function() {
              if ($scope.channel.nativeParams.secret === $scope.fakePassword) {
                $scope.channel.nativeParams.secret = '';
              }
            };

            $scope.fillAsteriskPassword = function() {
              if ($scope.channel.nativeParams.secret === '') {
                $scope.channel.nativeParams.secret = $scope.fakePassword;
              }
            };

            $scope.save = function (form) {
              if ( form.$valid && $scope.isValid()) {
                if (mode === 'create') {
                  Channels.save({channelIdx:widget.channels.length}, $scope.channel).$promise
                    .then(function() {
                      modalInstanceChannel.close();
                      self.findWidget();
                    })
                    .catch(function(response) {
                      $translate(response.data.message).then(function(v){
                        $scope.error = v;
                      });
                    });
                } else if (spec.mode === 'edit') {
                  if ($scope.channel.nativeParams.secret === $scope.fakePassword) {
                    delete $scope.channel.nativeParams.secret;
                  }
                  Channels.update({}, $scope.channel).$promise.then(function() {
                    modalInstanceChannel.close();
                    self.findWidget();
                  });
                }
              }
            };

            $scope.isValid = function() {
              if ($scope.channel.type === 'asterisk'){
                if ($scope.channel.nativeParams.callMethod === '2') {
                  if (!$scope.channel.nativeParams.method2Params.routes.length) {
                    return false;
                  }
                }
              }
              return true;
            };

            $scope.addRoute = function() {
              modalInstanceAddRoute= $uibModal.open({
                animation: true,
                templateUrl: 'addRoute.html',
                windowClass:'asterisk-route-add',
                resolve:{
                  channel: function () {
                    return $scope.channel;
                  }
                },
                controller: function ($scope, $stateParams, channel) {
                  $scope.channel = channel;
                  $scope.add = function (route, form) {
                    if (form) {
                      form.$submitted = true;
                    }
                    if (_.isEmpty(form.$error) && route && route.channel) {
                      if (!channel.nativeParams) {
                        channel.nativeParams = {};
                      }
                      if (!channel.nativeParams.method2Params.routes) {
                        channel.nativeParams.method2Params.routes = [];
                      }
                      route.idx = channel.nativeParams.method2Params.routes.length;
                      channel.nativeParams.method2Params.routes.push(route);
                      modalInstanceAddRoute.close();
                    }
                  };

                  $scope.cancel = function () {
                    modalInstanceAddRoute.dismiss('cancel');
                  };
                }
              });
            };

            $scope.deleteRoute = function(routeToDelete) {
              _.remove($scope.channel.nativeParams.method2Params.routes, function(route) {
                return route.phonePrefix === routeToDelete.phonePrefix && route.channel === routeToDelete.channel;
              });
              _.forEach($scope.channel.nativeParams.method2Params.routes, function(route) {
                if (route.idx > routeToDelete.idx) {
                  route.idx = route.idx - 1;
                }
              });
            };

            $scope.moveRoute = function(routeToMove, direction) {
              var idxCurrent = routeToMove.idx;
              var idxNew = idxCurrent + direction;
              var route = _.find($scope.channel.nativeParams.method2Params.routes, function(route) {
                return route.idx === idxNew;
              });
              routeToMove.idx = idxNew;
              route.idx = idxCurrent;
            };

            $scope.isFirst = function(route) {
              return route.idx === 0;
            };

            $scope.isLast = function(route) {
              return route.idx === $scope.channel.nativeParams.method2Params.routes.length - 1;
            };

            $scope.cancel = function () {
              modalInstanceChannel.dismiss('cancel');
            };
          }
        });
      };

      $scope.moveChannel = function(channelToMove, direction) {
        var idxCurrent = channelToMove.idx;
        var idxNew = idxCurrent + direction;
        var channel = _.find($scope.widget.channels, function(channel) {
          return channel.idx === idxNew;
        });
        channelToMove.idx = idxNew;
        channel.idx = idxCurrent;
      };

      $scope.isFirst = function(channel) {
        return channel.idx === 0;
      };

      $scope.isLast = function(channel) {
        return channel.idx === $scope.widget.channels.length - 1;
      };

      $scope.getChannelInfo = function(channel) {
        return WidgetsHelper.getChannelInfo(channel);
      };

      $scope.hasOnlineChannels = function(widget) {
        if (widget) {
          var onlineChannel = _.find(widget.channels, function(channel) {
            return channel.model.type === 'asterisk';
          });
          return !!onlineChannel;
        }
      };

      this.findWidgets = function() {
        WidgetsHelper.findWidgets()
          .then(function(widgets) {
            $scope.widgets = widgets;
            if (!widgets.length) {
              $scope.emptyText = 'VIEW_WIDGETS_EMPTY_TEXT';
            }
          });
      };

      this.findWidget = function() {
        WidgetsHelper.findWidget($stateParams.widgetId)
          .then(function(widget) {
            $scope.widget = widget;
            if (!widget.channels.length) {
              $scope.channelsEmptyText = 'VIEW_CHANNELS_EMPTY_TEXT';
            }
            CallbackRequestsHelper.getCallbackRequestsCount({widget:widget._id})
              .then(function(data) {
                if (data.count === 0) {
                  $timeout(function(){
                    $scope.isWidgetCodeCollapsed = false;
                  }, 500);
                }
              });
            var port = '';
            if ($location.port() != 80 || $location.port() != 443) {
              port =  ':'+ $location.port();
            }
            var url = 'https://' + $location.host() + port;
            $scope.widgetCodeLines =
              [
                '<!--Start Call42 Widget code -->',
                '<link rel="stylesheet" type="text/css" href="' + url + '/widget/css/style.css">',
                '<script type="text/javascript">',
                'var widget_server_host = "' + url + '";',
                'var widget_id = "' + $scope.widget._id + '";',
                'var widget_options = {show_phoneicon: true};',
                '</script>',
                '<script type="text/javascript" src="' + url + '/widget/js/callback.js"></script>',
                '<!-- End Call42 Widget code -->'
              ];
            _.forEach(widget.public.texts, function(k, v){
              $translate(k).then(function (text) {
                $scope.widget.public.texts[v] = text;
              });
            });
          });
      };
    }
  ]);

