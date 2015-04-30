/**
 * BMotion Studio for ProB Common Module
 *
 */
define(['angular-route', 'bms.common'], function () {
        return angular.module('prob.common', ['ngRoute', 'bms.common'])
            .factory('initProB', ['$q', 'ws', function ($q, ws) {
                var defer = $q.defer();
                ws.emit('initProB', "", function (data) {
                    defer.resolve(data);
                });
                return defer.promise;
            }]);
    }
);
