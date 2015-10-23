/**
 * BMotion Studio Session Module
 *
 */
define(['angular', 'bms.socket'], function (angular) {

        return angular.module('bms.session', ['bms.socket'])
            .factory('bmsInitSessionService', ['$q', 'ws',
                function ($q, ws) {

                    return function (manifestFilePath, manifestData) {

                        var defer = $q.defer();

                        var probPreferences = {
                            preferences: {}
                        };
                        if (manifestData['prob'] !== undefined) {
                            probPreferences = manifestData['prob'];
                        }

                        ws.emit('initSession', {
                            data: {
                                tool: manifestData['tool'] === undefined ? 'BAnimation' : manifestData['tool'],
                                prob: probPreferences,
                                model: manifestData['model'],
                                manifest: manifestFilePath
                            }
                        }, function (r) {
                            if (r.errors) {
                                defer.reject(r.errors)
                            } else {
                                defer.resolve(r)
                            }
                        });

                        return defer.promise;

                    };

                }]);

    }
);
