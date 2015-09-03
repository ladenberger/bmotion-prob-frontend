/**
 * BMotion Studio for ProB UI Module
 *
 */
define(['bms.nwjs'], function () {

    var module = angular.module('prob.standalone.view', ['bms.nwjs'])
        .controller('bmsVisualizationCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {
            var self = this;
            self.view = $routeParams.view;
            self.sessionId = $routeParams.sessionId;
        }])
        .factory('bmsViewMenuService', ['$rootScope', 'GUI', 'MenuService', function ($rootScope, GUI, MenuService) {

            return {
                buildDiagramMenu: function (menu) {

                    // Diagram menu
                    var diagramMenu = new GUI.Menu();
                    diagramMenu.append(new GUI.MenuItem({
                        label: 'Element Projection Diagram',
                        click: function () {
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('openElementProjectionModal');
                            });
                        },
                        enabled: false
                    }));
                    diagramMenu.append(new GUI.MenuItem({
                        label: 'Trace Diagram',
                        click: function () {
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('openTraceDiagramModal');
                            });
                        },
                        enabled: false
                    }));
                    menu.append(new GUI.MenuItem({
                        label: 'Diagram',
                        submenu: diagramMenu
                    }));

                    return diagramMenu;

                },
                buildProBMenu: function (menu) {

                    // Navigation button actions ...
                    var openDialog = function (type) {
                        $rootScope.$apply(function () {
                            $rootScope.$broadcast('openDialog_' + type);
                        });
                    };

                    MenuService.buildDebugMenu(menu);

                    // ProB menu
                    var probMenu = new GUI.Menu();
                    probMenu.append(new GUI.MenuItem({
                        label: 'Events',
                        click: function () {
                            openDialog('Events');
                        },
                        enabled: false
                    }));
                    probMenu.append(new GUI.MenuItem({
                        label: 'History',
                        click: function () {
                            openDialog('CurrentTrace');
                        },
                        enabled: false
                    }));
                    probMenu.append(new GUI.MenuItem({
                        label: 'State',
                        click: function () {
                            openDialog('StateInspector');
                        },
                        enabled: false
                    }));
                    probMenu.append(new GUI.MenuItem({
                        label: 'Animations',
                        click: function () {
                            openDialog('CurrentAnimations');
                        },
                        enabled: false
                    }));
                    probMenu.append(new GUI.MenuItem({
                        label: 'Console',
                        click: function () {
                            openDialog('GroovyConsoleSession');
                        },
                        enabled: false
                    }));
                    probMenu.append(new GUI.MenuItem({
                        label: 'Model Checking',
                        click: function () {
                            openDialog('ModelCheckingUI');
                        },
                        enabled: false
                    }));

                    menu.append(new GUI.MenuItem({
                        label: 'ProB',
                        submenu: probMenu
                    }));

                    return probMenu;

                },
                enableAllItems: function (menu) {
                    if (menu) {
                        angular.forEach(menu.items, function (i) {
                            i.enabled = true;
                        });
                    }
                }
            }

        }])
        .controller('bmsStandaloneViewCtrl', ['$scope', 'bmsViewMenuService', 'Menu', 'Window', function ($scope, bmsViewMenuService, Menu, Window) {
            var menu = Menu.createNewMenu();
            var probMenu = bmsViewMenuService.buildProBMenu(menu);
            var diagramMenu = bmsViewMenuService.buildDiagramMenu(menu);
            Window.menu = menu;
            $scope.$on('visualizationLoaded', function () {
                bmsViewMenuService.enableAllItems(probMenu);
                bmsViewMenuService.enableAllItems(diagramMenu);
            });
        }])
        .controller('bmsStandaloneRootViewCtrl', ['$scope', 'bmsViewMenuService', 'MenuService', 'Menu', 'Window', function ($scope, bmsViewMenuService, MenuService, Menu, Window) {
            var menu = Menu.createNewMenu();
            MenuService.buildFileBMenu(menu);
            var probMenu = bmsViewMenuService.buildProBMenu(menu);
            var diagramMenu = bmsViewMenuService.buildDiagramMenu(menu);
            Window.menu = menu;
            $scope.$on('visualizationLoaded', function () {
                bmsViewMenuService.enableAllItems(probMenu);
                bmsViewMenuService.enableAllItems(diagramMenu);
            });
        }]);

    return module;

});