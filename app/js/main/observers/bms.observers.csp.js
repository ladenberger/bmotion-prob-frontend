/**
 * BMotion Studio for ProB Observer CSP Module
 *
 */
define(['bms.func', 'jquery', 'angular', 'prob.modal'], function(bms, $, angular) {

  return angular.module('bms.observers.csp', ['prob.modal'])
    .factory('csp-event', ['ws', '$q', 'bmsVisualizationService',
      function(ws, $q, bmsVisualizationService) {
        'use strict';

        var expressionCache = {};

        var replaceParameter = function(str, para) {
          var fstr = str;
          angular.forEach(para, function(p, i) {
            var find = '{{a' + (i + 1) + '}}';
            var re = new RegExp(find, 'g');
            fstr = fstr.replace(re, p);
          });
          return fstr;
        };

        var getExpression = function(sessionId, visId, observer, stateId) {

          var defer = $q.defer();

          var formulas = [];
          angular.forEach(observer.data.observers, function(o) {
            if (o.exp) formulas.push({
              formula: o.exp
            });
          });

          var expressions = expressionCache[visId];
          if (!expressions) {
            ws.emit("evaluateFormulas", {
              data: {
                id: sessionId,
                formulas: formulas,
                stateId: stateId
              }
            }, function(data) {
              expressionCache[visId] = data;
              angular.forEach(data, function(e) {
                if (!e.error) {
                  e.trans = e.result.replace("{", "").replace("}", "").split(",");
                }
              });
              defer.resolve(data);
            });
          } else {
            defer.resolve(expressions);
          }

          return defer.promise;

        };

        var cspEventObserver = {

          getDefaultOptions: function(options) {
            return bms.normalize($.extend({
              cause: "AnimationChanged",
              observers: []
            }, options), []);
          },
          apply: function(sessionId, visId, observer, container, options) {

            var defer = $q.defer();

            var stateId = options.stateId;

            ws.emit("observeHistory", {
              data: {
                id: sessionId,
                stateId: stateId
              }
            }, function(data) {

              getExpression(sessionId, visId, observer, stateId).then(function(expressions) {

                var fmap = {};

                var keepGoing = true;

                angular.forEach(data, function(t) {

                  if (keepGoing) {

                    angular.forEach(observer.data.observers, function(o) {

                      var events = [];
                      if (o.exp) {
                        var eventsFromExp = expressions[o.exp].trans;
                        if (eventsFromExp) {
                          events = events.concat(eventsFromExp);
                        }
                      }
                      if (o.events) {
                        events = events.concat(o.events);
                      }
                      if ($.inArray(t['opString'], events) > -1) {
                        if (o.trigger) {
                          o.trigger.call(this, t);
                        }
                        angular.forEach(o.actions, function(a) {
                          var selector;
                          if (bms.isFunction(a.selector)) {
                            selector = a.selector.call(this, t);
                          } else {
                            selector = replaceParameter(a.selector, t['parameter']);
                          }
                          var attr = replaceParameter(a.attr, t['parameter']);
                          var value = replaceParameter(a.value, t['parameter']);

                          var bmsids = bmsVisualizationService.getBmsIds(visId, selector, container);
                          angular.forEach(bmsids, function(id) {
                            if (fmap[id] === undefined) {
                              fmap[id] = {};
                            }
                            fmap[id][attr] = value;
                          });
                        });
                      }

                    });

                  }

                  keepGoing = t['group'] === 'past';

                });

                defer.resolve(fmap);

              });

            });

            return defer.promise;

          },

          check: function(sessionId, visId, observer, container, stateId) {

            var defer = $q.defer();

            cspEventObserver.apply(sessionId, visId, observer, container, {
              stateId: stateId
            }).then(function(d) {
              defer.resolve(d);
            });

            return defer.promise;
          }

        };

        return cspEventObserver;

      }
    ]);


});
