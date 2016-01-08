/**
 * BMotion Studio Session Module
 *
 */
define(['angular', 'bms.socket'], function (angular) {

    return angular.module('bms.session', ['bms.socket'])

        .factory('bmsSessionService', ['$q', 'ws',
            function ($q, ws) {

                var factory = {

                    loadServerData: function (sessionId) {
                        var defer = $q.defer();
                        ws.emit('initView', {
                            data: {
                                id: sessionId
                            }
                        }, function (data) {
                            if (data['errors']) {
                                defer.reject(data['errors']);
                            } else {
                                defer.resolve(data);
                            }
                        });
                        return defer.promise;
                    },
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
                    init: function (modelPath, tool, options, manifestFilePath) {
                        var defer = $q.defer();
                        ws.emit('initSession', {
                            data: {
                                manifest: manifestFilePath,
                                model: modelPath,
                                tool: tool,
                                options: options
                            }
                        }, function (r) {
                            if (r['errors']) {
                                defer.reject(r['errors'])
                            } else {
                                defer.resolve(r)
                            }
                        });
                        return defer.promise;
                    },
                    initFormalModelOnlySession: function (modelPath, tool, options) {
                        var defer = $q.defer();
                        factory.init(modelPath, tool, options)
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
