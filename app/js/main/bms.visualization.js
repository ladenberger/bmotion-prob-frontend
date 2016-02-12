/**
 * BMotion Studio Visualization Module
 *
 */
define(['angular', 'jquery', 'prob.modal'], function(angular, $) {

  return angular.module('bms.visualization', ['prob.modal'])
    .factory('bmsVisualizationService', ['bmsModalService', '$injector', '$q', function(bmsModalService, $injector, $q) {
      var currentVisualization,
        visualizations = {},
        disabledTabs = {};

      var visualizationService = {

        isBAnimation: function(visId) {
          var vis = bmsVisualizationService.getCurrentVisualization();
          return vis && (vis['tool'] === 'EventBVisualisation' || vis['tool'] === 'ClassicalBVisualisation');
        },
        getDisabledTabs: function() {
          return disabledTabs;
        },
        disableTab: function(id, reason) {
          if (disabledTabs[id] === undefined) disabledTabs[id] = {};
          disabledTabs[id]['status'] = true;
          disabledTabs[id]['reason'] = reason;
        },
        addVisualization: function(visId, data) {
          visualizations[visId] = data;
        },
        getVisualizations: function() {
          return visualizations;
        },
        getVisualization: function(visId) {
          if (visualizations[visId] === undefined) {
            visualizations[visId] = {
              observers: {
                json: [],
                js: []
              },
              events: {
                json: [],
                js: []
              },
              svg: {}
            };
          }
          return visualizations[visId];
        },
        setCurrentVisualizationId: function(visId) {
          currentVisualization = visId;
        },
        getCurrentVisualizationId: function() {
          return currentVisualization;
        },
        getCurrentVisualization: function() {
          return visualizations[currentVisualization];
        },
        addSvg: function(visId, svg) {
          var vis = visualizationService.getVisualization(visId);
          if (vis) {
            if (!vis['svg'][svg]) vis['svg'][svg] = {};
            return visualizations[visId]['svg'][svg];
          }
        },
        getSvg: function(visId, svg) {
          var vis = visualizationService.getVisualization(visId);
          if (vis) {
            return vis['svg'][svg];
          }
        },
        addListener: function(visId, what, callback) {
          var vis = visualizationService.getVisualization(visId);
          if (vis) {
            if (!vis['listener']) vis['listener'] = [];
            if (!vis['listener'][what]) vis['listener'][what] = [];
            var obj = {
              callback: callback,
              executed: false
            };
            vis['listener'][what].push(obj);
            return obj;
          }
        },
        addObserverEvent: function(visId, list, e, origin) {
          var vis = visualizationService.getVisualization(visId);
          if (vis) {
            try {
              var instance = $injector.get(e.type, "");
            } catch (err) {
              bmsModalService.setError("Observer or event with type '" + e.type + "' does not exists! (Selector: " + e.data.selector + ")");
            } finally {
              if (instance && (typeof instance.getDefaultOptions === "function")) {
                e.data = instance.getDefaultOptions(e.data);
              }
              if (vis[list] === undefined) vis[list] = {};
              if (vis[list][origin] === undefined) vis[list][origin] = [];
              vis[list][origin].push(e);
            }
          }
        },
        addObserver: function(visId, o, origin) {
          visualizationService.addObserverEvent(visId, "observers", o, origin);
        },
        addEvent: function(visId, e, origin) {
          visualizationService.addObserverEvent(visId, "events", e, origin);
        },
        addObservers: function(visId, obs) {
          angular.forEach(obs, function(o) {
            visualizationService.addObserver(visId, o)
          });
        },
        addEvents: function(visId, evts) {
          angular.forEach(evts, function(e) {
            visualizationService.addEvent(visId, e)
          });
        },
        getJsonObservers: function(visId) {
          return visualizationService.getObservers(visId, 'json');
        },
        getJsObservers: function(visId) {
          return visualizationService.getObservers(visId, 'js');
        },
        getJsonEvents: function(visId) {
          return visualizationService.getEvents(visId, 'json');
        },
        getJsEvents: function(visId) {
          return visualizationService.getEvents(visId, 'js');
        },
        getObservers: function(visId, list) {
          var vis = visualizationService.getVisualization(visId);
          var observers = [];
          if (vis) {
            if (!list) {
              // If no list was passed, return all available observers
              observers = vis['observers']['js'].concat(vis['observers']['json']);
            } else {
              observers = vis['observers'][list];
            }
          }
          return observers;
        },
        getEvents: function(visId, list) {
          var vis = visualizationService.getVisualization(visId);
          var events = [];
          if (vis) {
            if (!list) {
              // If no list was passed, return all available events
              events = vis['events']['js'].concat(vis['events']['json']);
            } else {
              events = vis['events'][list];
            }
          }
          return events;
        },
        clearObservers: function(visId, list) {
          var vis = visualizationService.getVisualization(visId);
          if (vis && !list) {
            // If no list was passed, return all available observers
            vis['observers']['js'] = [];
            vis['observers']['json'] = [];
          } else {
            vis['observers'][list] = [];
          }
        },
        clearEvents: function(visId, list) {
          var vis = visualizationService.getVisualization(visId);
          if (vis && !list) {
            // If no list was passed, return all available observers
            vis['events']['js'] = [];
            vis['events']['json'] = [];
          } else {
            vis['events'][list] = [];
          }
        },
        clearListeners: function(visId) {
          var vis = visualizationService.getVisualization(visId);
          if (vis) vis['listener'] = [];
        }

      };

      return visualizationService;

    }]);

});
