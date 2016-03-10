/**
 * BMotion Studio for ProB Observer Module
 *
 */
define(['bms.func', 'jquery', 'angular', 'qtip', 'prob.modal', 'bms.observers.formula', 'bms.observers.refinement', 'bms.observers.predicate', 'bms.observers.csp', 'bms.observers.data'], function(bms, $, angular) {

  return angular.module('bms.observers', ['prob.modal', 'bms.observers.formula', 'bms.observers.refinement', 'bms.observers.predicate', 'bms.observers.csp', 'bms.observers.data'])
    .service('bmsObserverService', ['$q', '$injector', 'trigger', 'bmsModalService',
      function($q, $injector, trigger, bmsModalService) {
        'use strict';
        var observerService = {
          checkObserver: function(sessionId, visId, observer, container, stateId, cause, data) {
            return observerService.checkObservers(sessionId, visId, [observer], container, stateId, cause, data);
          },
          checkObservers: function(sessionId, visId, observers, container, stateId, cause, data) {

            var defer = $q.defer();

            var formulaObservers = [];
            var predicateObservers = [];
            var promises = [];
            var errors = [];

            if (!cause) cause = trigger.TRIGGER_ANIMATION_CHANGED;
            //observerService.hideErrors(container);

            angular.forEach(observers, function(o) {
              if (o.type === 'formula') {
                formulaObservers.push(o);
              } else if (o.type === 'predicate') {
                predicateObservers.push(o);
              } else {
                try {
                  var observerInstance = $injector.get(o.type, "");
                } catch (err) {
                  var err = "No observer with type '" + o.type + "' exists!";
                  if (o.data.selector) err = err + " (Selector: " + o.data.selector + ")";
                  errors.push(err);
                } finally {
                  if (observerInstance) {
                    promises.push(observerInstance.check(sessionId, visId, o, container, stateId, cause, data));
                  }
                }
              }
            });

            // Special case for formula observers
            if (!$.isEmptyObject(formulaObservers)) {
              // Execute formula observer at once (performance boost)
              var observerInstance = $injector.get("formula", "");
              promises.push(observerInstance.check(sessionId, visId, formulaObservers, container, stateId, cause, data));
            }

            // Special case for predicate observers
            if (!$.isEmptyObject(predicateObservers)) {
              // Execute predicate observer at once (performance boost)
              var observerInstance = $injector.get("predicate", "");
              promises.push(observerInstance.check(sessionId, visId, predicateObservers, container, stateId, cause, data));
            }

            if (errors.length > 0) {
              bmsModalService.setError(errors.join("<br/>"));
            }

            $q.all(promises)
              .then(function(res) {
                defer.resolve(res);
              });

            return defer.promise;

          }

        };
        return observerService;
      }
    ]);

});
