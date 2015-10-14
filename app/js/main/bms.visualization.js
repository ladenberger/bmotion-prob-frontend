/**
 * BMotion Studio Visualization Module
 *
 */
define(['angular', 'jquery', 'prob.modal'], function (angular, $) {

        return angular.module('bms.visualization', ['prob.modal'])
            .factory('bmsVisualizationService', ['bmsModalService', '$injector', function (bmsModalService, $injector) {
                var currentVisualization,
                    visualizations = {};

                var visualizationService = {

                    addVisualization: function (visId, data) {
                        visualizations[visId] = data;
                    },
                    getVisualizations: function () {
                        return visualizations;
                    },
                    getVisualization: function (visId) {
                        return visualizations[visId];
                    },
                    setCurrentVisualizationId: function (visId) {
                        currentVisualization = visId;
                    },
                    getCurrentVisualizationId: function () {
                        return currentVisualization;
                    },
                    getCurrentVisualization: function () {
                        return visualizations[currentVisualization];
                    },
                    addSvg: function (visId, svg) {
                        if (!visualizations[visId]['svg']) visualizations[visId]['svg'] = [];
                        if (visualizations[visId]['svg'].indexOf(svg) === -1) visualizations[visId]['svg'].push(svg);
                    },
                    addListener: function (visId, what, callback) {
                        if (!visualizations[visId]['listener']) visualizations[visId]['listener'] = [];
                        if (!visualizations[visId]['listener'][what]) visualizations[visId]['listener'][what] = [];
                        var obj = {
                            callback: callback,
                            executed: false
                        };
                        visualizations[visId]['listener'][what].push(obj);
                        return obj;
                    },
                    addObserverEvent: function (visId, list, e, origin) {
                        try {
                            var instance = $injector.get(e.type, "");
                        } catch (err) {
                            bmsModalService.setError("Observer or event with type '" + e.type + "' does not exists! (Selector: " + e.data.selector + ")");
                        } finally {
                            if (instance && (typeof instance.getDefaultOptions === "function")) {
                                var vis = visualizations[visId];
                                if (vis) {
                                    e.data = instance.getDefaultOptions(e.data);
                                    vis[list][origin].push(e);
                                }
                            }
                        }
                    },
                    addObserver: function (visId, o, origin) {
                        visualizationService.addObserverEvent(visId, "observers", o, origin);
                    },
                    addEvent: function (visId, e, origin) {
                        visualizationService.addObserverEvent(visId, "events", e, origin);
                    },
                    addObservers: function (visId, obs) {
                        angular.forEach(obs, function (o) {
                            visualizationService.addObserver(visId, o)
                        });
                    },
                    addEvents: function (visId, evts) {
                        angular.forEach(evts, function (e) {
                            visualizationService.addEvent(visId, e)
                        });
                    },
                    getJsonObservers: function (visId) {
                        return visualizationService.getObservers(visId, 'json');
                    },
                    getJsObservers: function (visId) {
                        return visualizationService.getObservers(visId, 'js');
                    },
                    getObservers: function (visId, list) {
                        var vis = visualizationService.getVisualization(visId);
                        if (!list) {
                            // If no list was passed, return all available observers
                            return $.extend([], vis['observers']['js'], vis['observers']['json']);
                        } else {
                            return vis['observers'][list];
                        }
                    },
                    getEvents: function (visId, list) {
                        var vis = visualizationService.getVisualization(visId);
                        if (!list) {
                            // If no list was passed, return all available events
                            return $.extend([], vis['events']['js'], vis['events']['json']);
                        } else {
                            return vis['events'][list];
                        }
                    }

                };

                return visualizationService;

            }]);

    }
);
