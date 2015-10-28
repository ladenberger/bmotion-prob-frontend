/**
 * BMotion Studio Session Module
 *
 */
define(['angular', 'bms.socket'], function (angular) {

    return angular.module('bms.session', ['bms.socket'])
        .factory('openModelService', ['electronDialog', '$q', '$uibModal', function (electronDialog, $q, $uibModal) {

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
        .factory('bmsInitSessionService', ['$q', 'ws', 'openModelService',
            function ($q, ws, openModelService) {

                var getModel = function (manifestData) {

                    var defer = $q.defer();

                    if (!manifestData['model']) {
                        openModelService().then(function (model) {
                            defer.resolve(model);
                        });
                    } else {
                        defer.resolve(manifestData['model']);
                    }

                    return defer.promise;

                };

                return function (manifestFilePath, manifestData) {

                    var defer = $q.defer();

                    getModel(manifestData).then(function (modelPath) {

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
                                model: modelPath,
                                manifest: manifestFilePath
                            }
                        }, function (r) {
                            if (r.errors) {
                                defer.reject(r.errors)
                            } else {
                                defer.resolve(r)
                            }
                        });

                    });

                    return defer.promise;

                };

            }]);

});
