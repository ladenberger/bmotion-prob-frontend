/**
 * BMotion Studio Config Module
 *
 */
define(['tv4', 'prob.common'], function (tv4) {

        return angular.module('bms.config', ['prob.common'])
            .factory('bmsConfigService', ['$q', '$http', 'manifestConstants', function ($q, $http, manifestConstants) {
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
                            }).error(function (data, status, headers, config) {
                                if (status === 404) {
                                    defer.reject("File not found: " + config.url);
                                } else {
                                    defer.reject("Some error occurred while requesting file " + config.url);
                                }
                            });
                        }
                        return defer.promise;
                    },
                    validate: function (manifestFilePath) {

                        var defer = $q.defer();

                        var filename = manifestFilePath.replace(/^.*[\\\/]/, '');
                        if (filename === 'bmotion.json') {
                            $http.get(manifestFilePath).success(function (configData) {
                                if (tv4.validate(configData, manifestConstants.MANIFEST_SCHEME)) {
                                    defer.resolve(configData);
                                } else {
                                    defer.reject("BMotion manifest file (bmotion.json) invalid: " + tv4.error.message + " (" + tv4.error.dataPath + ")");
                                }
                            }).error(function (data, status, headers, config) {
                                if (status === 404) {
                                    defer.reject("File not found: " + config.url);
                                } else {
                                    defer.reject("Some error occurred while requesting file " + config.url);
                                }
                            });
                        } else {
                            defer.reject('Invalid file, please open a bmotion.json file!');
                        }

                        return defer.promise;

                    }
                };
                return main;
            }]);

    }
);
