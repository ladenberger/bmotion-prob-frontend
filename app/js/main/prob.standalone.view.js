/**
 * BMotion Studio for ProB UI Module
 *
 */
define(['bms.nwjs', 'prob.standalone.menu'], function () {

    var module = angular.module('prob.standalone.view', ['bms.nwjs', 'prob.standalone.menu'])
        .controller('bmsVisualizationCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {
            var self = this;
            self.view = $routeParams.view;
            self.sessionId = $routeParams.sessionId;
        }])
        .controller('bmsStandaloneViewCtrl', ['$scope', 'probStandaloneMenuService', 'Menu', 'Window', function ($scope, probStandaloneMenuService, Menu, Window) {
            var menu = Menu.createNewMenu();
            probStandaloneMenuService.buildProBDebugMenu(menu);
            var probMenu = probStandaloneMenuService.buildProBMenu(menu);
            var diagramMenu = probStandaloneMenuService.buildDiagramMenu(menu);
            Window.menu = menu;
            $scope.$on('visualizationLoaded', function () {
                probStandaloneMenuService.enableAllItems(probMenu);
                probStandaloneMenuService.enableAllItems(diagramMenu);
            });
        }])
        .controller('bmsStandaloneRootViewCtrl', ['$scope', 'probStandaloneMenuService', 'bmsMenuService', 'Menu', 'Window', function ($scope, probStandaloneMenuService, bmsMenuService, Menu, Window) {
            var menu = Menu.createNewMenu();
            bmsMenuService.buildFileBMenu(menu);
            probStandaloneMenuService.buildProBDebugMenu(menu);
            var probMenu = probStandaloneMenuService.buildProBMenu(menu);
            var diagramMenu = probStandaloneMenuService.buildDiagramMenu(menu);
            Window.menu = menu;
            $scope.$on('visualizationLoaded', function () {
                probStandaloneMenuService.enableAllItems(probMenu);
                probStandaloneMenuService.enableAllItems(diagramMenu);
            });
        }]);

    return module;

});