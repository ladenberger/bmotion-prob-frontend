/**
 * BMotion Studio for ProB Standalone View Module
 *
 */
define(['bms.electron', 'bms.visualization', 'ng-electron'], function () {

    var module = angular.module('prob.standalone.vis.view', ['bms.electron', 'bms.visualization', 'ngElectron'])
        .controller('bmsVisualizationCtrl', ['$scope', '$location', '$routeParams',
            function ($scope, $location, $routeParams) {
                var self = this;
                self.view = $routeParams.view;
                self.sessionId = $routeParams.sessionId;
                self.file = $routeParams.file;
            }])
        .controller('bmsStandaloneViewCtrl', ['$scope', '$routeParams', 'electronWindow', 'electron',
            function ($scope, $routeParams, electronWindow, electron) {
                var winId = parseInt($routeParams.win);
                var title = 'BMotion Studio for ProB (' + $routeParams.view + ')';
                $scope.$on('visualizationLoaded', function (evt, visualization) {
                    var win = electronWindow.fromId(winId);
                    win.setTitle(title);
                    electron.send({
                        type: "buildVisualizationMenu",
                        tool: visualization['manifest']['tool'],
                        addMenu: false,
                        win: winId
                    }, win);
                });
            }])
        .controller('bmsStandaloneRootViewCtrl', ['$scope', '$routeParams', 'electronWindow', 'electron',
            function ($scope, $routeParams, electronWindow, electron) {
                var winId = parseInt($routeParams.win);
                var view = $routeParams.view ? '(' + $routeParams.view + ')' : '';
                var title = 'BMotion Studio for ProB ' + view;
                $scope.$on('visualizationLoaded', function (evt, visualization) {
                    var win = electronWindow.fromId(winId);
                    win.setTitle(title);
                    electron.send({
                        type: "buildVisualizationMenu",
                        tool: visualization['manifest']['tool'],
                        addMenu: true,
                        win: winId
                    }, win);
                });
            }]);

    return module;

});