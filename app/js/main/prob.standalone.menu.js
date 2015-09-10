/**
 * BMotion Studio Node Webkit Module
 *
 */
define(['angular', 'bms.electron'], function () {

    var module = angular.module('prob.standalone.menu', ['bms.electron'])
        .factory('probStandaloneMenuService', ['$rootScope', 'electronMenuService', function ($rootScope, electronMenuService) {

            return {
                buildDiagramMenu: function (menu, vis) {

                    var diagramMenu = new electronMenuService.createNewMenu();
                    diagramMenu.append(electronMenuService.createMenuItem({
                        label: 'Trace Diagram',
                        click: function () {
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('openTraceDiagramModal');
                            });
                        }
                    }));
                    diagramMenu.append(electronMenuService.createMenuItem({
                        label: 'Element Projection Diagram',
                        click: function () {
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('openElementProjectionModal');
                            });
                        },
                        enabled: vis.tool === 'BAnimation'
                    }));

                    menu.append(electronMenuService.createMenuItem({
                        label: 'Diagram',
                        submenu: diagramMenu
                    }));

                },
                buildProBMenu: function (menu) {

                    var openDialog = function (type) {
                        $rootScope.$apply(function () {
                            $rootScope.$broadcast('openDialog_' + type);
                        });
                    };

                    var probMenu = new electronMenuService.createNewMenu();
                    probMenu.append(electronMenuService.createMenuItem({
                        label: 'Events',
                        click: function () {
                            openDialog('Events');
                        }
                    }));
                    probMenu.append(electronMenuService.createMenuItem({
                        label: 'History',
                        click: function () {
                            openDialog('CurrentTrace');
                        }
                    }));
                    probMenu.append(electronMenuService.createMenuItem({
                        label: 'State',
                        click: function () {
                            openDialog('StateInspector');
                        }
                    }));
                    probMenu.append(electronMenuService.createMenuItem({
                        label: 'Animations',
                        click: function () {
                            openDialog('CurrentAnimations');
                        }
                    }));
                    probMenu.append(electronMenuService.createMenuItem({
                        label: 'Model Checking',
                        click: function () {
                            openDialog('ModelCheckingUI');
                        }
                    }));

                    menu.append(electronMenuService.createMenuItem({
                        label: 'ProB',
                        submenu: probMenu
                    }));

                },
                buildProBDebugMenu: function (menu) {

                    var debugMenu = electronMenuService.buildDebugMenu(menu);
                    debugMenu.append(electronMenuService.createMenuItem({
                        label: 'Console',
                        click: function () {
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('openDialog_GroovyConsoleSession');
                            });
                        }
                    }));

                },
                enableAllItems: function (menu) {
                    if (menu) {
                        angular.forEach(menu.items, function (i) {
                            i.enabled = true;
                        });
                    }
                }
            }

        }]);

    return module;

});