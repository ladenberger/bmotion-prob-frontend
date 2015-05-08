/**
 * BMotion Studio Common Module
 *
 */
define(['socketio', 'angular-route'], function (io) {

        return angular.module('bms.common', ['ngRoute'])
            .factory('bmsConfigService', ['$q', '$http', function ($q, $http) {
                var config = null;
                var main = {
                    getConfig: function () {
                        var defer = $q.defer();
                        if (config) {
                            defer.resolve(config);
                        } else {
                            $http.get('bmotion.json').success(function (data) {
                                config = $.extend({
                                    socket: {
                                        "host": "localhost",
                                        "port": "19090"
                                    },
                                    prob: {
                                        "host": "localhost"
                                    }
                                }, data, true);
                                defer.resolve(config);
                            });
                        }
                        return defer.promise;
                    }
                };
                return main;
            }])
            .factory('bmsMainService', ['ws', '$q', '$http', function (ws, $q, $http) {
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
            .factory('bmsSocketService', ['bmsConfigService', '$q', function (bmsConfigService, $q) {
                'use strict';
                var socket = null;
                return {
                    socket: function () {
                        var defer = $q.defer();
                        if (socket === null) {
                            bmsConfigService.getConfig().then(function (config) {
                                // TODO: Check if configuration file is correct!
                                socket = io.connect('http://' + config.socket.host + ':' + config.socket.port);
                                defer.resolve(socket);
                            });
                        } else {
                            defer.resolve(socket);
                        }
                        return defer.promise;
                    }
                };
            }])
            .factory('ws', ['$rootScope', 'bmsSocketService', function ($rootScope, bmsSocketService) {
                'use strict';
                return {
                    emit: function (event, data, callback) {
                        bmsSocketService.socket().then(function (socket) {
                            socket.emit(event, data, function () {
                                var args = arguments;
                                $rootScope.$apply(function () {
                                    if (callback) {
                                        callback.apply(null, args);
                                    }
                                });
                            });
                        });
                    },
                    on: function (event, callback) {
                        bmsSocketService.socket().then(function (socket) {
                            socket.on(event, function () {
                                var args = arguments;
                                $rootScope.$apply(function () {
                                    callback.apply(null, args);
                                });
                            });
                        });
                    }
                };
            }])
            .factory('initSession', ['$q', 'ws', function ($q, ws) {
                return {
                    init: function (data) {
                        var defer = $q.defer();
                        ws.emit('initSession', {data: data}, function (r) {
                            if (r.errors) {
                                defer.reject(r.errors)
                            } else {
                                defer.resolve(r)
                            }
                        });
                        return defer.promise;
                    }
                };
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
