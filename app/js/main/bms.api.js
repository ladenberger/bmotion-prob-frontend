define(['angular', 'jquery', 'bms.func', 'prob.modal', 'bms.session', 'prob.observers'], function(angular, $, bms) {

  angular.module('bms.api', ['prob.modal', 'bms.session', 'prob.observers'])
    .factory('bmsApiService', ['ws', '$injector', 'trigger', 'bmsSessionService', 'bmsObserverService', 'bmsVisualizationService', 'bmsObserverService', 'bmsModalService',
      function(ws, $injector, trigger, bmsSessionService, bmsObserverService, bmsVisualizationService, bmsModalService) {

        var attributeValues = {};

        var getValues = function(visId) {
          if (!attributeValues[visId]) {
            attributeValues[visId] = {};
          }
          return attributeValues[visId];
        };

        var setValues = function(visId, values) {
          $.extend(true, getValues(visId), values);
        };

        var triggerObservers = function(visId, stateId, cause, list) {
          var observers = bmsVisualizationService.getObservers(visId, list);
          checkObservers(visId, observers, stateId, cause);
        };

        var triggerJsonObservers = function(visId, stateId, cause) {
          triggerObservers(visId, stateId, cause, 'json');
        };

        var triggerListeners = function(visId, cause) {
          var vis = bmsVisualizationService.getVisualization(visId);
          if (vis.listener) {
            angular.forEach(vis.listener[cause], function(l) {
              if (!l.executed) {
                l.callback(vis);
                // Init listener should be called only once
                if (cause === "ModelInitialised") l.executed = true;
              }
            });
          }
        };

        var setupJsonEvents = function(visId) {
          setupEvents(visId, 'json');
        };

        var setupEvent = function(visId, evt) {
          var vis = bmsVisualizationService.getVisualization(visId);
          bmsObserverService.setupEvent(bmsSessionService.getSessionId(), visId, evt, vis.container.contents(), vis.traceId);
        };

        var triggerObserver = function(visId, observer, stateId, cause) {
          checkObservers(visId, [observer], stateId, cause);
        };

        var checkObservers = function(visId, observers, stateId, cause) {

          var vis = bmsVisualizationService.getVisualization(visId);
          var stateId = stateId ? stateId : vis.stateId;
          var cause = cause ? cause : trigger.TRIGGER_ANIMATION_CHANGED;
          var initialised = vis.initialised ? vis.initialised : false;

          if (stateId && initialised) {

            // Collect values from observers
            bmsObserverService.checkObservers(bmsSessionService.getSessionId(), visId, observers, vis.container.contents(), stateId, cause)
              .then(function(data) {

                var values = {};

                angular.forEach(data, function(value) {
                  if (value !== undefined) {
                    $.extend(true, values, value);
                  }
                });

                if (!bms.isEmpty(values)) {
                  setValues(visId, values);
                }

              });

          }

        };

        var setupEvents = function(visId, list) {
          var vis = bmsVisualizationService.getVisualization(visId);
          var events = bmsVisualizationService.getEvents(visId, list);
          bmsObserverService.setupEvents(bmsSessionService.getSessionId(), visId, events, vis.container.contents(), vis.traceId);
        };

        var addObserver = function(visId, type, data, list) {
          var observer = {
            type: type,
            data: data
          };
          var vis = bmsVisualizationService.getVisualization(visId);
          // Add observer ..
          bmsVisualizationService.addObserver(visId, observer, list);
          // ... and trigger observer
          if (vis.stateId !== 'root' && vis.initialised && vis.lastOperation !== '$setup_constants') {
            triggerObserver(visId, observer, vis.stateId, data.cause);
          }
        };

        var addEvent = function(visId, type, data, list) {
          var ev = {
            type: type,
            data: data
          };
          var vis = bmsVisualizationService.getVisualization(visId);
          // Add event ...
          bmsVisualizationService.addEvent(visId, ev, list);
          // ... and setup event
          var instance = $injector.get(type, "");
          if (instance) {
            instance.setup(bmsSessionService.getSessionId(), visId, ev, vis.container.contents(), vis.traceId);
          }
        };

        var on = function(visId, what, callback) {
          var vis = bmsVisualizationService.getVisualization(visId);
          var listener = bmsVisualizationService.addListener(visId, what, callback);
          if (what === "ModelInitialised" && vis.initialised && listener) {
            var vis = bmsVisualizationService.getVisualization(visId);
            // Init listener should be called only once
            listener.callback(vis);
            listener.executed = true;
          }
        };

        var getModelData = function(visId, what, options) {
          ws.emit('getModelData', {
            data: {
              id: bmsSessionService.getSessionId(),
              what: what
            }
          }, function(r) {
            console.log(options)
            options.trigger(r);
          });
        };

        var eval = function(options) {

          var options = bms.normalize($.extend({
            formulas: [],
            translate: false,
            trigger: function() {}
          }, options), ["trigger"]);

          ws.emit('evaluateFormulas', {
            data: {
              id: bmsSessionService.getSessionId(),
              formulas: options.formulas.map(function(f) {
                return {
                  formula: f,
                  translate: options.translate
                }
              })
            }
          }, function(r) {

            var errors = [];
            var results = [];

            angular.forEach(options.formulas, function(f) {
              if (r[f]['error']) {
                var errorMsg = r[f]['error'] + " ("
                if (options.selector) {
                  errorMsg = errorMsg + "selector: " + options.selector + ", ";
                }
                errorMsg = errorMsg + "formula: " + f + ")";
                errors.push(errorMsg);
              } else {
                results.push(r[f]['trans'] !== undefined ? r[f]['trans'] : r[f]['result']);
              }
            });

            if (errors.length === 0) {
              if (options.selector) {
                options.trigger($scope.visualization.container.contents().find(options.selector), results);
              } else {
                options.trigger(results);
              }
            } else {
              bmsModalService.openErrorDialog(errors);
            }

          });

        };

        return {
          eval: eval,
          addObserver: addObserver,
          addEvent: addEvent,
          getValues: getValues,
          triggerObservers: triggerObservers,
          triggerJsonObservers: triggerJsonObservers,
          triggerListeners: triggerListeners,
          setupEvents: setupEvents,
          setupJsonEvents: setupJsonEvents,
          getModelData: getModelData,
          on: on
        }

      }
    ]);

});
