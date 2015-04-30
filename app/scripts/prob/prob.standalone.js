/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'bmotion.func', 'angular', 'bootstrap', 'jquery.cookie', 'jquery-ui', 'prob.graph', 'prob.iframe', 'prob.ui', 'prob.common'], function (angularAMD, prob) {

    var module = angular.module('prob.standalone', ['prob.graph', 'prob.iframe', 'prob.ui', 'prob.common'])
        .run(['ws', 'editableOptions', 'initProB', 'bmsMainService', '$rootScope', function (ws, editableOptions, initProB, bmsMainService, $rootScope) {
            bmsMainService.mode = 'ModeStandalone';
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
            initProB.then(function (data) {
                if (data) {
                    $rootScope.port = data.port;
                }
            });
            // Load native UI library
            var gui = require('nw.gui');
            // Get the current window
            var win = gui.Window.get();
            // Listen to close event
            win.on('close', function () {
                this.hide(); // Pretend to be closed already
                ws.emit('clientClosed', {data: {}});
                //this.close(true);
            });
        }])
        .factory('fileDialogService', ['$q', function ($q) {
            return {
                open: function () {
                    var defer = $q.defer();
                    var fileDialog = $("#fileDialog");
                    fileDialog.click(function () {
                        this.value = null;
                    });
                    fileDialog.change(function () {
                        var template = $(this).val();
                        defer.resolve(template);
                    });
                    fileDialog.trigger('click');
                    return defer.promise;
                }
            };
        }])
        .controller('bmsTabsCtrl', ['$rootScope', '$scope', 'fileDialogService', 'bmsVisualisationService', '$http', 'bmsUIService', function ($rootScope, $scope, fileDialogService, bmsVisualisationService, $http, bmsUIService) {

            var setAllInactive = function () {
                angular.forEach($scope.workspaces, function (workspace) {
                    workspace.active = false;
                });
            };

            $scope.workspaces = [];

            $scope.addWorkspace = function () {
                setAllInactive();
            };

            $scope.openFileDialog = function () {
                fileDialogService.open().then(function (template) {
                    $http.get(template).success(function (data) {
                        $scope.workspaces.push({
                            id: prob.uuid(),
                            name: data.name,
                            template: template,
                            active: true
                        });
                    });
                });
            };

            $scope.selectWorkspace = function (id) {
                var vis = bmsVisualisationService.getVisualisation(id);
                $rootScope.currentVisualisation = id;
                if (vis) {
                    bmsUIService.setProBViewTraceId(vis.traceId);
                }
            };

        }])
        .controller('bmsTabsChildCtrl', ['$scope', function ($scope) {
        }]);
    return angularAMD.bootstrap(module);

});