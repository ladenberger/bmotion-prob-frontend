/**
 * BMotion Studio for ProB Standalone View Module
 *
 */
define(['bms.electron', 'prob.standalone.menu', 'bms.visualization'], function () {

    var module = angular.module('prob.standalone.view', ['bms.electron', 'prob.standalone.menu', 'bms.visualization'])
        .controller('bmsVisualizationCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {
            var self = this;
            self.view = $routeParams.view;
            self.sessionId = $routeParams.sessionId;
        }])
        .controller('bmsStandaloneViewCtrl', ['$scope', '$routeParams', 'electronWindow', 'electronMenu', 'electronMenuService', 'probStandaloneMenuService', 'bmsVisualizationService', function ($scope, $routeParams, electronWindow, electronMenu, electronMenuService, probStandaloneMenuService, bmsVisualizationService) {
            var winId = parseInt($routeParams.win);
            var title = 'BMotion Studio for ProB (' + $routeParams.view + ')';
            $scope.$on('visualizationLoaded', function (evt, visId) {
                var win = electronWindow.fromId(winId);
                win.setTitle(title);
                win.setAlwaysOnTop(true);
                var menu = electronMenuService.createNewMenu();
                probStandaloneMenuService.buildProBMenu(menu);
                probStandaloneMenuService.buildDiagramMenu(menu, bmsVisualizationService.getVisualization(visId));
                probStandaloneMenuService.buildProBDebugMenu(menu);
                probStandaloneMenuService.buildProBHelpMenu(menu);
                win.setMenu(menu);
            });
        }])
        .controller('bmsStandaloneRootViewCtrl', ['$scope', '$routeParams', 'electronWindow', 'electronMenu', 'electronMenuService', 'probStandaloneMenuService', 'bmsVisualizationService', function ($scope, $routeParams, electronWindow, electronMenu, electronMenuService, probStandaloneMenuService, bmsVisualizationService) {
            var winId = parseInt($routeParams.win);
            var view = $routeParams.view ? '(' + $routeParams.view + ')' : '';
            var title = 'BMotion Studio for ProB ' + view;
            $scope.$on('visualizationLoaded', function (evt, visId) {
                var win = electronWindow.fromId(winId);
                win.setTitle(title);
                var menu = electronMenuService.createNewMenu();
                //electronMenuService.buildFileMenu(menu);
                probStandaloneMenuService.buildProBMenu(menu);
                probStandaloneMenuService.buildDiagramMenu(menu, bmsVisualizationService.getVisualization(visId));
                probStandaloneMenuService.buildProBDebugMenu(menu);
                probStandaloneMenuService.buildProBHelpMenu(menu);
                win.setMenu(menu);
            });
        }]);

    return module;

});