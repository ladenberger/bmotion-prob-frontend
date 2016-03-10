/**
 * BMotion Studio for ProB Observer Refinement Module
 *
 */
define(['bms.func', 'jquery', 'angular', 'prob.modal'], function(bms, $, angular) {

  return angular.module('bms.observers.refinement', ['prob.modal'])
    .factory('refinement', ['ws', '$q', 'bmsVisualizationService',
      function(ws, $q, bmsVisualizationService) {
        'use strict';
        var refinementObserver = {
          getDefaultOptions: function(options) {
            return $.extend({
              refinement: ""
            }, options);
          },
          apply: function(sessionId, visId, observer, container) {

            var defer = $q.defer();

            var obj = {};
            var vis = bmsVisualizationService.getVisualization(visId);
            var visRefinements = vis["model"]["refinements"];

            if (visRefinements) {

              var jcontainer = $(container);

              var el = container.find(observer.data.selector);
              el.each(function(i, v) {
                var rr;
                var e = $(v);
                var ref = bms.callOrReturn(observer.data["refinement"], e, jcontainer);
                //var observerRefinements = Object.prototype.toString.call(refs) !== '[object Array]' ? [refs] : refs;
                // TODO: Maybe an intersection of both arrays (visRefinements and observerRefinements) would be more efficient.
                if ($.inArray(ref, visRefinements) > -1) {
                  rr = bms.callOrReturn(observer.data['enable'], e, jcontainer);
                } else {
                  rr = bms.callOrReturn(observer.data['disable'], e, jcontainer);
                }
                if (rr) {
                  var bmsid = bmsVisualizationService.getBmsIdForElement(e);
                  obj[bmsid] = rr;
                }
              });

            }

            defer.resolve(obj);

            return defer.promise;

          },
          check: function(sessionId, visId, observer, container, stateId, trigger) {

            var defer = $q.defer();

            //TODO: Check refinement observer only once!

            defer.resolve(refinementObserver.apply(sessionId, visId, observer, container));

            return defer.promise;

          }
        };

        return refinementObserver;

      }
    ]);

});
