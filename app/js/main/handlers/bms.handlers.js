/**
 * BMotion Studio for ProB Handler Module
 *
 */
define(['angular', 'prob.modal', 'bms.handlers.event'], function(angular) {

  return angular.module('bms.handlers', ['prob.modal', 'bms.handlers.event'])
    .service('bmsHandlerService', ['$q', '$injector', 'bmsModalService',
      function($q, $injector, bmsModalService) {
        'use strict';
        var service = {
          setupEvent: function(sessionId, visId, evt, container, traceId) {
            try {
              var instance = $injector.get(evt.type, "");
              instance.setup(sessionId, visId, evt, container, traceId);
            } catch (err) {
              bmsModalService.openErrorDialog("No handler with type '" + evt.type + "' exists!");
            }
          },
          setupEvents: function(sessionId, visId, evts, container, traceId) {
            angular.forEach(evts, function(evt) {
              service.setupEvent(sessionId, visId, evt, container, traceId);
            });
          }
        };
        return service;
      }
    ]);

});
