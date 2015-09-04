/**
 * BMotion Studio Node Webkit Module
 *
 */
define(['angular', 'bms.nwjs'], function () {

    var module = angular.module('prob.standalone.menu', ['bms.nwjs'])
        .factory('probStandaloneMenuService', ['$rootScope', 'GUI', 'bmsMenuService', function ($rootScope, GUI, bmsMenuService) {

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
                    /*probMenu.append(new GUI.MenuItem({
                     label: 'Console',
                     click: function () {
                     openDialog('GroovyConsoleSession');
                     },
                     enabled: false
                     }));*/
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
                buildProBDebugMenu: function (menu) {

                    var debugMenu = bmsMenuService.buildDebugMenu(menu);

                    debugMenu.append(new GUI.MenuItem({
                        label: 'Console',
                        click: function () {
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('openDialog_GroovyConsoleSession');
                            });
                        }
                    }));

                    return debugMenu;

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