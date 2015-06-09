/**
 * BMotion Studio Config Module
 *
 */
define(['angular'], function () {

        return angular.module('bms.config', [])
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
            }]);
        
    }
);
