/**
 * BMotion Studio for ProB Observer Predicate Module
 *
 */
define(['bms.func', 'jquery', 'angular', 'prob.modal'], function(bms, $, angular) {

  return angular.module('bms.observers.predicate', ['prob.modal'])
    .factory('predicate', ['ws', '$q', 'bmsVisualizationService',
      function(ws, $q, bmsVisualizationService) {
        'use strict';
        var predicateObserver = {

          getDefaultOptions: function(options) {
            return $.extend({
              predicate: "",
              true: {},
              false: {},
              cause: "AnimationChanged"
            }, options);
          },
          getFormulas: function(observer) {
            return [{
              formula: observer.data.predicate,
              translate: false
            }];
          },
          shouldBeChecked: function(visId, obj) {
            var visualization = bmsVisualizationService.getVisualization(visId);
            var check = true;
            if (obj.data.refinement !== undefined && !bms.inArray(obj.data.refinement, visualization["model"]["refinements"])) {
              check = false;
            }
            return check;
          },
          apply: function(sessionId, visId, observer, container, options) {

            var defer = $q.defer();
            var selector = observer.data.selector;
            if (selector) {
              var fvalues = {};
              var result = options.result;
              var element = container.find(observer.data.selector);
              var jcontainer = $(container);
              element.each(function() {
                var ele = $(this);
                var returnValue;
                //var normalized = bms.normalize(observer.data, [], ele);
                if (result[0] === "TRUE") {
                  returnValue = bms.callOrReturn(observer.data.true, ele, jcontainer);
                } else if (result[0] === "FALSE") {
                  returnValue = bms.callOrReturn(observer.data.false, ele, jcontainer);
                }
                if (returnValue) {
                  var bmsid = bmsVisualizationService.getBmsIdForElement(ele);
                  fvalues[bmsid] = returnValue;
                }
              });
              defer.resolve(fvalues);
            } else {
              // TODO: We need a more meaningful error message
              bmsModalService.setError("Please specify a selector!");
              defer.resolve();
            }

            return defer.promise;

          },
          check: function(sessionId, visId, observer, container, stateId, trigger) {
            var defer = $q.defer();
            var promises = [];
            //var startWebsocket = new Date().getTime();
            var observers = Object.prototype.toString.call(observer) !== '[object Array]' ? [observer] : observer;
            // Collect formulas
            var formulas = [];
            angular.forEach(observers, function(o) {
              if (o.data.cause === trigger) {
                formulas.push({
                  formula: o.data.predicate,
                  translate: o.data.translate ? o.data.translate : false
                });
              }
            });
            ws.emit("evaluateFormulas", {
              data: {
                id: sessionId,
                formulas: formulas,
                stateId: stateId
              }
            }, function(data) {
              //var end = new Date().getTime();
              //var time = end - startWebsocket;
              //console.log('WEBSOCKET: ' + time);
              //var startPredicate = new Date().getTime();
              angular.forEach(observers, function(o) {
                if (o.data.cause === trigger) {
                  var r = data[o.data.predicate];
                  if (r) {
                    promises.push(predicateObserver.apply(sessionId, visId, o, container, {
                      result: [r.result]
                    }));
                  }
                }
              });
              //var endPredicate = new Date().getTime();
              //var time = endPredicate - startPredicate;
              //console.log('PREDICATE OBSERVER: ' + time);
              var fvalues = {};
              $q.all(promises).then(function(data) {
                angular.forEach(data, function(value) {
                  if (value !== undefined) {
                    $.extend(true, fvalues, value);
                  }
                });
                defer.resolve(fvalues);
              });
            });
            return defer.promise;
          }
        };

        return predicateObserver;

      }
    ]);

});
