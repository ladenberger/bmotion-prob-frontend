/**
 * BMotion Studio Config Module
 *
 */
define(['jquery', 'angular', 'tv4', 'bms.common'], function ($, angular, tv4) {

        return angular.module('bms.config', ['bms.common'])
            .constant('configScheme', {
                "title": "BMotion Studio Config",
                "type": "object",
                "properties": {
                    "socket": {
                        "type": "object",
                        "properties": {
                            "host": {
                                "type": "string",
                                "description": "Host name of websocket server."
                            },
                            "port": {
                                "type": "string",
                                "description": "Port of websocket server."
                            }
                        }
                    },
                    "prob": {
                        "type": "object",
                        "properties": {
                            "host": {
                                "type": "string"
                            },
                            "binary": {
                                "type": "string"
                            },
                            "version": {
                                "type": "string"
                            },
                            "revision": {
                                "type": "string"
                            }
                        }
                    }
                }
            })
            .factory('bmsConfigService', ['$q', '$http', 'configScheme', 'bmsMainService',
                function ($q, $http, configScheme, bmsMainService) {
                    var config = null;
                    var main = {
                        getConfig: function () {
                            var defer = $q.defer();
                            if (config) {
                                defer.resolve(config);
                            } else {
                                main.validateConfig()
                                    .then(function (data) {
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
                                    }, function (error) {
                                        defer.reject(error);
                                    });
                            }
                            return defer.promise;
                        },
                        validateConfig: function () {
                            var defer = $q.defer();
                            var path = bmsMainService.mode === "ModeStandalone" ? '../bmotion.json' : 'bmotion.json';
                            $http.get(path).success(function (configData) {
                                if (tv4.validate(configData, configScheme)) {
                                    defer.resolve(configData);
                                } else {
                                    defer.reject("BMotion Studio config file (bmotion.json) invalid: " + tv4.error.message + " (" + tv4.error.dataPath + ")");
                                }
                            }).error(function (data, status, headers, config) {
                                if (status === 404) {
                                    defer.reject("File not found: " + config.url);
                                } else {
                                    defer.reject("Some error occurred while requesting BMotion Studio config file (bmotion.json).");
                                }
                            });
                            return defer.promise;
                        }
                    };
                    return main;
                }]);

    }
);
