/**
 * BMotion Studio for ProB Editor Module
 *
 */
define(['jquery', 'prob.modal', 'bms.common', 'ng-electron'], function ($) {

    var module = angular.module('prob.iframe.editor', ['prob.modal', 'bms.common', 'ngElectron'])
        .factory('fs', function () {
            return require('fs');
        })
        .directive('bmsVisualisationEditor', ['bmsVisualizationService', 'bmsModalService', 'bmsMainService', '$q', '$http', 'fs', '$rootScope', 'electron',
            function (bmsVisualizationService, bmsModalService, bmsMainService, $q, $http, fs, $rootScope, electron) {
                return {
                    replace: false,
                    scope: {
                        svg: '@bmsSvgFile',
                        id: '@bmsVisualisationId',
                        view: '@bmsVisualisationView',
                        sessionId: '@bmsVisualisationEditor'
                    },
                    template: '<iframe src="editor/editor.html" class="editorIframe"></iframe>',
                    controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

                        // Parent API (called from prob.template)
                        // --------------------------------------

                        $scope.addObserver = function (type, data) {
                            bmsVisualizationService.addObserver($scope.id, {
                                type: type,
                                data: data
                            }, 'json');
                        };

                        $scope.addEvent = function (type, data) {
                            bmsVisualizationService.addEvent($scope.id, {
                                type: type,
                                data: data
                            }, 'json');
                        };

                        $scope.disableEditor = function (reason) {
                            bmsVisualizationService.disableTab($scope.svg, reason);
                        };

                        $scope.openDialog = function (msg, cb) {
                            electron.dialog.showMessageBox({
                                title: "Please confirm",
                                type: "info",
                                buttons: ["Ok", "Cancel"],
                                message: msg,
                            }, cb);
                        };

                        // --------------------------------------

                        $scope.bmsModalService = bmsModalService;

                        $scope.init = function () {

                            var defer = $q.defer();

                            var vis = bmsVisualizationService.getVisualization($scope.id);
                            if (vis) {
                                $http.get(vis['templateFolder'] + '/' + $scope.svg).success(function (svgContent) {
                                    defer.resolve({
                                        vis: vis,
                                        svgFile: $scope.svg,
                                        svgContent: svgContent
                                    });
                                }).error(function () {
                                    defer.reject("Some error occurred while requesting SVG file " + $scope.svg);
                                });
                            } else {
                                defer.reject("No visualisation found with id " + $scope.id);
                            }

                            return defer.promise;

                        };

                        var saveSvg = function (templateFolder, svg) {
                            var defer = $q.defer();
                            fs.writeFile(templateFolder + '/' + $scope.svg, svg,
                                function (err) {
                                    if (err) {
                                        defer.reject("An error occurred while writing svg file " + $scope.svg + ": " + err);
                                    } else {
                                        defer.resolve();
                                    }
                                });
                            return defer.promise;
                        };

                        var saveObservers = function (templateFolder, viewData) {
                            var defer = $q.defer();
                            var jsonObservers = {observers: bmsVisualizationService.getJsonObservers($scope.id)};
                            var jsonString = JSON.stringify(jsonObservers, null, "    ");
                            var observersViewPath = viewData['observers'] ? viewData['observers'] : 'views/' + viewData['id'] + '.observers.json';
                            fs.writeFile(templateFolder + '/' + observersViewPath, jsonString,
                                function (err) {
                                    if (err) {
                                        defer.reject("An error occurred while writing file " + observersViewPath + ": " + err);
                                    } else {
                                        defer.resolve();
                                    }
                                });
                            return defer.promise;
                        };

                        var saveEvents = function (templateFolder, viewData) {
                            var defer = $q.defer();
                            var jsonEvents = {events: bmsVisualizationService.getJsonEvents($scope.id)};
                            var jsonString = JSON.stringify(jsonEvents, null, "    ");
                            var eventsViewPath = viewData['events'] ? viewData['events'] : 'views/' + viewData['id'] + '.events.json';
                            fs.writeFile(templateFolder + '/' + eventsViewPath, jsonString,
                                function (err) {
                                    if (err) {
                                        defer.reject("An error occurred while writing file " + eventsViewPath + ": " + err);
                                    } else {
                                        defer.resolve();
                                    }
                                });
                            return defer.promise;
                        };

                        $scope.save = function (svg) {
                            var vis = bmsVisualizationService.getVisualization($scope.id);
                            if (vis) {
                                bmsModalService.loading("Saving svg ...");
                                var templateFolder = vis['templateFolder'];
                                saveSvg(templateFolder, svg)
                                    .then(function () {
                                        bmsModalService.loading("Saving observers ...");
                                        return saveObservers(templateFolder, vis['view']);
                                    })
                                    .then(function () {
                                        bmsModalService.loading("Saving events ...");
                                        return saveEvents(templateFolder, vis['view']);
                                    })
                                    .then(function () {
                                        bmsModalService.endLoading("");
                                        bmsModalService.openDialog("The visualization has been saved successfully.");
                                        $rootScope.$broadcast('visualizationSaved');
                                    }, function (error) {
                                        bmsModalService.openErrorDialog(error);
                                    });

                            } else {
                                bmsModalService.openErrorDialog("No visualisation found with id " + $scope.id);
                            }
                        };

                    }],
                    link: function ($scope, $element, attrs, ctrl) {
                    }
                }
            }]);

    return module;

});
