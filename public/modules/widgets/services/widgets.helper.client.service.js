'use strict';

angular.module('widgets')
  .factory('WidgetsHelper',['Widgets', 'Channels', 'lodash', function(Widgets, Channels, _) {
    var info;
    return {
      findWidgets: function(spec) {
        return Widgets.query(spec).$promise;
      },
      findWidget: function(widgetId) {
        return Widgets.get({widgetId: widgetId}).$promise;
      },
      updateWidget : function(widget) {
        return Widgets.update({':idWidget':widget._id}, widget).$promise;
      },
      createWidget : function(widget) {
        return  Widgets.save(widget).$promise;
      },
      deleteWidget : function(widget) {
        return Widgets.delete({}, widget).$promise;
      },
      findChannel: function(channelId) {
        return Channels.get({channelId: channelId}).$promise;
      },
      isWorkingHoursPresent: function(settings) {
        return settings.available  &&
          this.formatTime(settings.from) !== this.formatTime(settings.to) &&
          !(this.formatTime(settings.from) === '00:00' && this.formatTime(settings.to) === '24:00') &&
          !(this.formatTime(settings.to) === '00:00' && this.formatTime(settings.from) === '24:00')
          ;
      },
      isRoundTheClock: function(settings) {
        return settings.available  && (
            this.formatTime(settings.from) === this.formatTime(settings.to) ||
            (this.formatTime(settings.from) === '00:00' && this.formatTime(settings.to) === '24:00') ||
            (this.formatTime(settings.to) === '00:00' && this.formatTime(settings.from) === '24:00')
          );
      },
      getChannelInfo: function(channel) {
        switch (channel.type) {
          case 'email':
            info = channel.nativeParams.emails;break;
          case 'sms':
            info = channel.nativeParams.phone;break;
          case 'asterisk':
            info = channel.nativeParams.host + ':' + channel.nativeParams.port;break;
          default : info='';break;
        }
        return info;
      },
      formatTime: function(time) {
        return this.pad(time.hours) + ':' + this.pad(time.minutes);
      },
      pad: function( value ) {
        return ( angular.isDefined(value) && value.toString().length < 2 ) ? '0' + value : value;
      }
    };
  }]);