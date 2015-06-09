/**
 * BMotion Studio Socket Module
 *
 */
define(['socketio', 'angular', 'bms.config'], function (io) {

        return angular.module('bms.socket', ['bms.config'])
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
            }]);

    }
);
