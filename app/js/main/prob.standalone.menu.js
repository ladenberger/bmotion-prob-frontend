/**
 * BMotion Studio Node Webkit Module
 *
 */
define(['angular', 'bms.electron', 'bms.config'], function () {

    var module = angular.module('prob.standalone.menu', ['bms.electron', 'bms.config'])
        .factory('probStandaloneMenuService', ['$rootScope', 'electronMenuService', 'bmsConfigService', 'bmsModalService', 'electronRemote', function ($rootScope, electronMenuService, bmsConfigService, bmsModalService, electronRemote) {

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
                        enabled: vis['manifest']['tool'] === 'BAnimation'
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
                buildProBHelpMenu: function (menu) {
                    var helpMenu = new electronMenuService.createNewMenu();
                    helpMenu.append(electronMenuService.createMenuItem({
                        label: 'About',
                        click: function () {
                            bmsConfigService.getConfig().then(function (config) {
                                var app = electronRemote.require('app');
                                bmsModalService.openDialog("<p>BMotion Studio for ProB (version " + app.getVersion() + ")</p>" +
                                    "<p>ProB 2.0 (version " + config.prob.version + ")</p>" +
                                    "<p>" + config.prob.revision + "</p>");
                            });
                        }
                    }));
                    menu.append(electronMenuService.createMenuItem({
                        label: 'Help',
                        submenu: helpMenu
                    }));
                    return helpMenu;
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