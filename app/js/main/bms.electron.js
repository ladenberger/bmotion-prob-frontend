/**
 * BMotion Studio Node Webkit Module
 *
 */
define(['angular', 'prob.modal'], function () {

    var module = angular.module('bms.electron', ['prob.modal'])
        .factory('electronRemote', function () {
            return require('remote');
        })
        .factory('electronWindow', ['electronRemote', function (electronRemote) {
            return electronRemote.require('browser-window');
        }])
        .factory('electronMenu', ['electronRemote', function (electronRemote) {
            return electronRemote.require('menu');
        }])
        .factory('electronDialog', ['electronRemote', function (electronRemote) {
            return electronRemote.require('dialog');
        }])
        .factory('electronWindowService', ['electronWindow', function (electronWindow) {
            var factory = {
                createNewWindow: function () {
                    return new electronWindow({
                        height: 600,
                        width: 800,
                        title: 'BMotion Studio for ProB',
                        icon: __dirname + '/resources/icons/bmsicon16x16.png'
                    });
                }
            };
            return factory;
        }])
        .factory('electronMenuService', ['$rootScope', 'electronRemote', 'electronMenu', 'electronDialog', 'bmsModalService', function ($rootScope, electronRemote, electronMenu, electronDialog, bmsModalService) {

            var MenuItem = electronRemote.require('menu-item');

            var factory = {

                createMenuItem: function (options) {
                    return new MenuItem(options);
                },
                createNewMenu: function () {
                    return new electronMenu();
                },
                buildFileMenu: function (menu) {
                    var fileMenu = new electronMenu();
                    fileMenu.append(factory.createMenuItem({
                        label: 'Open Visualization',
                        accelerator: (function () {
                            if (process.platform == 'darwin')
                                return 'Alt+Command+O';
                            else
                                return 'Ctrl+Shift+O';
                        })(),
                        click: function () {
                            electronDialog.showOpenDialog(
                                {
                                    filters: [
                                        {name: 'BMotion Studio File', extensions: ['json']}
                                    ],
                                    properties: ['openFile']
                                },
                                function (files) {
                                    $rootScope.$broadcast('startVisualisationViaFileMenu', files[0]);
                                });
                        }
                    }));
                    menu.append(factory.createMenuItem({
                        label: 'File',
                        submenu: fileMenu
                    }));
                },
                buildDebugMenu: function (menu) {
                    var debugMenu = new electronMenu();
                    debugMenu.append(factory.createMenuItem({
                        label: 'Toggle Developer',
                        accelerator: (function () {
                            if (process.platform == 'darwin')
                                return 'Alt+Command+I';
                            else
                                return 'Ctrl+Shift+I';
                        })(),
                        click: function (item, focusedWindow) {
                            if (focusedWindow)
                                focusedWindow.toggleDevTools();
                        }
                    }));
                    debugMenu.append(factory.createMenuItem({
                        label: 'Reload',
                        accelerator: (function () {
                            if (process.platform == 'darwin')
                                return 'F5';
                            else
                                return 'F5';
                        })(),
                        click: function (item, focusedWindow) {
                            if (focusedWindow)
                                focusedWindow.reload();
                        }
                    }));
                    menu.append(factory.createMenuItem({
                        label: 'Debug',
                        submenu: debugMenu
                    }));
                    return debugMenu;
                },
                buildHelpMenu: function (menu) {
                    var helpMenu = new electronMenu();
                    helpMenu.append(factory.createMenuItem({
                        label: 'About',
                        click: function () {
                            var app = electronRemote.require('app');
                            bmsModalService.openDialog("BMotion Studio for ProB (v" + app.getVersion() + ")");
                        }
                    }));
                    menu.append(factory.createMenuItem({
                        label: 'Help',
                        submenu: helpMenu
                    }));
                    return helpMenu;
                }

            };

            return factory;

        }]);

    return module;

});