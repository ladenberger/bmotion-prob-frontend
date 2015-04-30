/**
 * BMotion Studio for ProB Common Module
 *
 */
define(['angular-route', 'bms.common'], function () {
        return angular.module('prob.common', ['ngRoute', 'bms.common'])
            .factory('probMainService', ['$q', 'ws', function ($q, ws) {
                var port = null;
                var main = {
                    getPort: function () {
                        var defer = $q.defer();
                        if (port) {
                            defer.resolve(port);
                        } else {
                            ws.emit('initProB', "", function (port) {
                                port = port;
                                defer.resolve(port);
                            });
                        }
                        return defer.promise;
                    }
                };
                return main;
            }]);
    }
);
