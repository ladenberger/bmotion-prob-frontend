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
