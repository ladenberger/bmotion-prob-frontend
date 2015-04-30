/**
 * BMotion Studio Common Module
 *
 */
define(['socketio', 'angular-route'], function (io) {

        return angular.module('bms.common', ['ngRoute'])
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
            .factory('bmsSocketService', ['$http', '$q', function ($http, $q) {
                'use strict';
                var socket = null;
                return {
                    socket: function () {
                        var defer = $q.defer();
                        if (socket === null) {
                            $http.get('bmotion.json').success(function (data) {
                                // TODO: Check if configuration file is correct!
                                socket = io.connect('http://' + data.socket.host + ':' + data.socket.port);
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
            .factory('loadModel', ['$q', 'ws', function ($q, ws) {
                return {
                    load: function (data) {
                        var defer = $q.defer();
                        ws.emit('loadModel', {data: data}, function (r) {
                            defer.resolve(r)
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
