'use strict';

angular.module('dashboard')
  .factory('DashboardHelper', ['lodash', function(_) {

    function getCallbackRequestsCount(spec) {
      var all = 0,
        failed = 0,
        day= getDayFormatted(spec.timestamp),
        successfulCallbackRequest,
        callbackRequestDay,
        callbackRequestTimestamp
        ;

      _.forEach(spec.callbackRequests, function(callbackRequest) {
        callbackRequestTimestamp = getTimestampDayStart(callbackRequest.created);
        callbackRequestDay = getDayFormatted(callbackRequestTimestamp);
        if (callbackRequest.widget.name === spec.widgetName && callbackRequestDay === day) {
          all+=1;
          successfulCallbackRequest = _.find(callbackRequest.notifications, function(notification) {
            return notification.success === true;
          });
          if (!successfulCallbackRequest) {
            failed+=1;
          }
        }
      });
      return {all:all, failed:failed};
    }

    function getTimestampDayStart(date) {
      var currentDate = new Date(date),
        dateStrict = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      return Date.parse(dateStrict);
    }

    function getDayFormatted(ts) {
      var dayDate = new Date(ts),
        day = dayDate.getDate(),
        dayMonth = dayDate.getMonth() + 1;

      if (day.toString().length === 1) {
        day = '0' + day;
      }
      if (dayMonth.toString().length === 1) {
        dayMonth = '0' + dayMonth;
      }
      return day + '.' + dayMonth;
    }

    function initChartsData(spec) {
      var data = [],
        hasCallbackRequests,
        points =  { show: true, radius: 4},
        lines = {show:true, lineWidth:3, fill:true, fillColor: { colors: [{opacity: 0.2}, {opacity: 0.8}]}};

      _.forEach(spec.widgets, function(widget) {
        hasCallbackRequests = _.find(spec.callbackRequests, function(callbackRequest) {
          return callbackRequest.widget.name === widget.name;
        });
        if (hasCallbackRequests) {
          data.push(
            {
              widgetName: widget.name,
              data:[
                {
                  data:[],
                  label: spec.chartTexts.labelAllCallbackRequestsText,
                  points: points,
                  lines: lines
                },
                {
                  data:[],
                  label: spec.chartTexts.labelFailedCallbackRequestsText,
                  points: points,
                  lines: lines
                }
              ]
            });
        }
      });
      return data;
    }

    return {
      getChartsData:function(spec) {
        var n, day, i = 1, ticks = [];
        var data = initChartsData(spec);
        var timestamp  = getTimestampDayStart(new Date) - 29 * 24 * 60 * 60 * 1000;
        var timestampLast = getTimestampDayStart(new Date()) + 24 * 60 * 60 * 1000;

        while(i <= 30) {

          day = getDayFormatted(timestamp);
          ticks.push([i, day]);
          if (timestampLast >= timestamp) {
            _.forEach(data, function(item) {
              n = getCallbackRequestsCount({callbackRequests:spec.callbackRequests, widgetName:item.widgetName, timestamp:timestamp});
              item.data[0].data.push([i, n.all]);
              item.data[1].data.push([i, n.failed]);
            });
          }

          timestamp +=  24 * 60 * 60 * 1000;
          i+=1;
        }

        return {data:data, ticks:ticks};
      },

      getLastCallbackRequests: function(spec) {
        var l = spec.callbackRequests.length;
        spec.callbackRequests = l > spec.count ? spec.callbackRequests.slice(l - spec.count, l) : spec.callbackRequests;
        return _.sortByOrder(spec.callbackRequests, ['created'], [false]);
      },

      setCallbackRequestsToWidgets:function(widgets, callbackRequests) {
        var isSuccessful, successfulCount;

        _.forEach(widgets, function(widget) {
          widget.callbackRequestsCount = 0;
          successfulCount = 0;
          _.forEach(callbackRequests, function(callbackRequest) {
            if (widget.name === callbackRequest.widget.name) {
              widget.callbackRequestsCount += 1;
              isSuccessful = _.find(callbackRequest.notifications, function(notification) {
                return notification.success === true;
              });
              if (isSuccessful) {
                successfulCount +=1;
              }
            }
          });
          widget.processedCallbackRequsestsPercent = '-';
          if (widget.callbackRequestsCount) {
            widget.processedCallbackRequsestsPercent = Math.floor((successfulCount/widget.callbackRequestsCount) * 100);
          }

        });
      }

    };
  }
  ]);