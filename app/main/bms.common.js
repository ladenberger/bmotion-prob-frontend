/**
 * BMotion Studio Common Module
 *
 */
define(['angular', 'bms.socket'], function () {

        return angular.module('bms.common', ['bms.socket'])
            .factory('bmsMainService', ['ws', '$q', function (ws, $q) {
                var main = {
                    mode: "ModeStandalone",
                    getFullPath: function (template) {
                        var defer = $q.defer();
                        if (main.mode === 'ModeIntegrated' || main.mode === 'ModeOnline') {
                            ws.emit('getWorkspacePath', "", function (data) {
                                var p = data.workspace + "/" + template;
                                var filename = p.replace(/^.*[\\\/]/, '');
                                path = p.replace(filename, '');
                                defer.resolve(path);
                            });
                        } else {
                            var filename = template.replace(/^.*[\\\/]/, '');
                            path = template.replace(filename, '');
                            defer.resolve(path);
                        }
                        return defer.promise;
                    }
                };
                return main;
            }])
            .factory('bmsVisualisationService', [function () {
                var visualisations = {};
                return {
                    addVisualisation: function (name, data) {
                        visualisations[name] = data;
                    },
                    getVisualisations: function () {
                        return visualisations;
                    },
                    getVisualisation: function (name) {
                        return visualisations[name];
                    },
                    addSvg: function (name, id, svg) {
                        if (!visualisations[name]['svg']) visualisations[name]['svg'] = {};
                        visualisations[name]['svg'][id] = svg;
                    }
                }
            }])
            .factory('bmsUIService', ['$rootScope', function ($rootScope) {

                return {
                    setProBViewTraceId: function (traceid) {
                        $rootScope.$broadcast('setProBViewTraceId', traceid);
                    },
                    reloadVisualisation: function (id) {
                        $rootScope.$broadcast('reloadVisualisation', id);
                    }
                }

            }]);

    }
);
