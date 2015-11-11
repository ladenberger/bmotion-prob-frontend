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
        .factory('openModelService', ['electronDialog', '$q', '$uibModal',
            function (electronDialog, $q, $uibModal) {

                return function () {

                    var defer = $q.defer();

                    var modalInstance = $uibModal.open({
                        templateUrl: 'resources/templates/bms-open-model.html',
                        controller: function ($scope, $modalInstance) {

                            $scope.openModel = function () {

                                electronDialog.showOpenDialog(
                                    {
                                        title: 'Please select a model.',
                                        filters: [
                                            {name: 'Model (*.mch, *.csp, *.bcm)', extensions: ['mch', 'csp', 'bcm']}
                                        ],
                                        properties: ['openFile']
                                    },
                                    function (files) {

                                        if (files) {

                                            var modelPath = files[0];
                                            $scope.$apply(function () {
                                                $scope.model = modelPath;
                                            });

                                        }

                                    }
                                );

                            };

                            $scope.close = function () {
                                $scope.$broadcast('show-errors-check-validity');

                                if ($scope.userForm.$valid) {
                                    // TODO: RETURN DATA
                                    $modalInstance.close($scope.model);
                                }
                            };

                            $scope.ok = function () {

                                $scope.close();
                            };

                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };

                        },
                        resolve: {},
                        backdrop: false
                    });
                    modalInstance.result.then(function (model) {
                        defer.resolve(model);
                    }, function () {
                        defer.reject();
                    });

                    return defer.promise;

                }

            }])
        .factory('bmsSessionService', ['$q', 'ws',
            function ($q, ws) {

                var getModel = function (modelPath) {

                    var defer = $q.defer();

                    if (!modelPath) {
                        defer.resolve(openModelService());
                    } else {
                        defer.resolve(modelPath);
                    }

                    return defer.promise;

                };

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
                    },
                    InitVisualizationSession: function (modelPath, tool, options, manifestFilePath) {
                        var defer = $q.defer();
                        getModel(modelPath)
                            .then(function (finalModelPath) {
                                factory.initSession(finalModelPath, tool, options, manifestFilePath)
                                    .then(function (data) {
                                        defer.resolve(data);
                                    }, function (errors) {
                                        defer.reject(errors)
                                    });
                            });
                        return defer.promise;
                    }

                };

                return factory;

            }
        ])

});
