/**
 * BMotion Studio for ProB Observer Data Module
 *
 */
define(['bms.func', 'jquery', 'angular', 'prob.modal'], function(bms, $, angular) {

  return angular.module('bms.observers.data', ['prob.modal'])
    .factory('nextEvents', ['ws', '$q',
      function(ws, $q) {
        'use strict';

        var oservice = {
          apply: function(sessionId, visId, observer, container, data) {

            var defer = $q.defer();

            if (observer.data.trigger !== undefined) {

              var selector = observer.data.selector;
              var self = this;
              if (selector) {
                var fvalues = {};
                var element = container.find(observer.data.selector);
                element.each(function() {
                  var ele = $(this);
                  var returnValue;
                  if (typeof observer.data.trigger === 'function') {
                    returnValue = observer.data.trigger.call(self, ele, data);
                  } else {
                    // Whenever the function comes from json, we need to convert
                    // the string function to a real javascript function
                    // TODO: We need to handle errors while converting the string function to a reals javascript function
                    returnValue = new Function('origin', 'events', observer.data.trigger)(ele, data);
                  }
                  if (returnValue) {
                    var bmsid = bmsVisualizationService.getBmsIdForElement(ele);
                    fvalues[bmsid] = returnValue;
                  }
                });
                defer.resolve(fvalues);
              } else {
                if (typeof observer.data.trigger === 'function') {
                  observer.data.trigger.call(self, data);
                } else {
                  new Function('events', observer.data.trigger)(data);
                }
                defer.resolve();
              }

            } else {
              defer.resolve();
            }

            return defer.promise;
          },
          check: function(sessionId, visId, observer, container, stateId, trigger) {
            var defer = $q.defer();
            ws.emit("observeNextEvents", {
              data: {
                id: sessionId,
                stateId: stateId
              }
            }, function(data) {
              /**
               * { data:
               *    {
               *      events: [
               *       { name: <event name>, parameter: <parameter as list> },
               *       ...
               *      ]
               *    }
               * }
               */
              defer.resolve(oservice.apply(sessionId, visId, observer, container, data));
              return defer.promise;
            });
          }
        };

        return oservice;

      }
    ])
    .factory('history', ['ws', '$q',
      function(ws, $q) {
        'use strict';

        var historyObserver = {
          apply: function(sessionId, visId, observer, container, history) {

            var defer = $q.defer();

            if (observer.data.trigger !== undefined) {

              var selector = observer.data.selector;
              var self = this;
              if (selector) {
                var fvalues = {};
                var element = container.find(observer.data.selector);
                element.each(function() {
                  var ele = $(this);
                  var returnValue;
                  if (typeof observer.data.trigger === 'function') {
                    returnValue = observer.data.trigger.call(self, ele, history);
                  } else {
                    // Whenever the function comes from json, we need to convert
                    // the string function to a real javascript function
                    // TODO: We need to handle errors while converting the string function to a reals javascript function
                    returnValue = new Function('origin', 'history', observer.data.trigger)(ele, history);
                  }
                  if (returnValue) {
                    var bmsid = bmsVisualizationService.getBmsIdForElement(ele);
                    fvalues[bmsid] = returnValue;
                  }
                });
                defer.resolve(fvalues);
              } else {
                if (typeof observer.data.trigger === 'function') {
                  observer.data.trigger.call(self, history);
                } else {
                  new Function('history', observer.data.trigger)(history);
                }
                defer.resolve();
              }

            } else {
              defer.resolve();
            }

            return defer.promise;
          },
          check: function(sessionId, visId, observer, container, stateId, trigger) {
            var defer = $q.defer();
            ws.emit("observeHistory", {
              data: {
                id: sessionId,
                stateId: stateId
              }
            }, function(data) {
              /**
               * { data:
               *    {
               *      events: [
               *       { name: <event name>, parameter: <parameter as list> },
               *       ...
               *      ]
               *    }
               * }
               */
              defer.resolve(historyObserver.apply(sessionId, visId, observer, container, data));
              return defer.promise;
            });
          }
        };

        return historyObserver;

      }
    ]);

});
