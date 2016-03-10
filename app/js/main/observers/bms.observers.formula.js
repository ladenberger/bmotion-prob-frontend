/**
 * BMotion Studio for ProB Observer Formula Module
 *
 */
define(['bms.func', 'jquery', 'angular', 'prob.modal'], function(bms, $, angular) {

  return angular.module('bms.observers.formula', ['prob.modal'])
    .factory('formula', ['ws', '$q', 'bmsModalService', 'bmsVisualizationService',
      function(ws, $q, bmsModalService, bmsVisualizationService) {
        'use strict';
        var formulaObserver = {
          getDefaultOptions: function(options) {
            return $.extend({
              formulas: [],
              cause: "AnimationChanged",
              trigger: function() {}
            }, options);
          },
          getFormulas: function(observer) {
            return bms.toList(observer.data.formulas).map(function(f) {
              return {
                formula: f,
                translate: observer.data.translate
              }
            });
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

            var result = options.result;

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
                    returnValue = observer.data.trigger.call(self, ele, result);
                  } else {
                    // Whenever the function comes from json, we need to convert
                    // the string function to a real javascript function
                    // TODO: We need to handle errors while converting the string function to a reals javascript function
                    returnValue = new Function('origin', 'values', observer.data.trigger)(ele, result);
                  }
                  if (returnValue) {
                    var bmsid = bmsVisualizationService.getBmsIdForElement(ele);
                    fvalues[bmsid] = returnValue;
                  }
                });
                defer.resolve(fvalues);
              } else {
                if (typeof observer.data.trigger === 'function') {
                  observer.data.trigger.call(self, result);
                } else {
                  new Function('values', observer.data.trigger)(result);
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

            var observers = Object.prototype.toString.call(observer) !== '[object Array]' ? [observer] : observer;

            // Collect formulas
            var formulas = [];
            angular.forEach(observers, function(o) {

              if (formulaObserver.shouldBeChecked(visId, o) && o.data.cause === trigger) {
                formulas = formulas.concat(bms.mapFilter(bms.toList(o.data.formulas), function(f) {
                  return {
                    formula: f,
                    translate: o.data.translate ? o.data.translate : false
                  };
                }));
              }

            });

            // Evaluate formulas and apply observers
            ws.emit("evaluateFormulas", {
              data: {
                id: sessionId,
                formulas: formulas,
                stateId: stateId
              }
            }, function(data) {

              var promises = [];
              var errors = [];
              angular.forEach(observers, function(o) {

                if (formulaObserver.shouldBeChecked(visId, o) && o.data.cause === trigger) {

                  var result = [];
                  angular.forEach(bms.toList(o.data.formulas), function(f) {
                    if (data[f]['error']) {
                      var err = data[f]['error'];
                      if (o.data.selector) err = err + " (formula observer, selector: " + o.data.selector + ", formula: " + f + ")";
                      errors.push(err);
                    } else {
                      result.push(data[f]['trans'] !== undefined ? data[f]['trans'] : data[f]['result']);
                    }
                  });

                  promises.push(formulaObserver.apply(sessionId, visId, o, container, {
                    result: result
                  }));

                }

              });

              var fvalues = {};
              if (errors.length === 0) {
                $q.all(promises).then(function(data) {
                  angular.forEach(data, function(value) {
                    if (value !== undefined) {
                      $.extend(true, fvalues, value);
                    }
                  });
                  defer.resolve(fvalues);
                });
              } else {
                bmsModalService.openErrorDialog(errors);
                defer.resolve(fvalues);
              }

            });

            return defer.promise;

          }
        };

        return formulaObserver;

      }
    ]);

});
