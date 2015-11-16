/**
 * BMotion Studio Session Module
 *
 */
define(['angular', 'bms.socket'], function (angular) {

    return angular.module('bms.session', ['bms.socket'])

        .factory('loadServerData', ['$q', 'ws',
            function ($q, ws) {

                return function (sessionId) {

                    var defer = $q.defer();
                    // Get data from server
                    ws.emit('initView', {data: {id: sessionId}}, function (data) {
                        if (data.errors) {
                            defer.reject(data.errors);
                        } else {
                            defer.resolve(data);
                        }
                    });
                    return defer.promise;

                };

            }])
        .factory('bmsSessionService', ['$q', 'ws',
            function ($q, ws) {

                var factory = {

                    destroy: function (sessionId) {
                        var defer = $q.defer();
                        ws.emit('destroySession', {
                            data: {
                                id: sessionId
                            }
                        }, function () {
                            defer.resolve()
                        });
                        return defer.promise;
                    },
                    initSession: function (modelPath, tool, options, manifestFilePath) {

                        var defer = $q.defer();

                        ws.emit('initSession', {
                            data: {
                                manifest: manifestFilePath,
                                model: modelPath,
                                tool: tool,
                                options: options
                            }
                        }, function (r) {
                            if (r.errors) {
                                defer.reject(r.errors)
                            } else {
                                defer.resolve(r)
                            }
                        });

                        return defer.promise;

                    },
                    initFormalModelOnlySession: function (modelPath, tool, options) {
                        var defer = $q.defer();
                        factory.initSession(modelPath, tool, options)
                            .then(function (data) {
                                defer.resolve(data);
                            }, function (errors) {
                                defer.reject(errors)
                            });
                        return defer.promise;
                    }

                };

                return factory;

            }
        ])

});
