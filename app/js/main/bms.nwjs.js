/**
 * BMotion Studio Node Webkit Module
 *
 */
define(['angular'], function () {

    var module = angular.module('bms.nwjs', [])
        .factory('Menu', ['$rootScope', 'GUI', 'Window', function ($rootScope, GUI, Window) {

            // Navigation button actions ...
            var openDialog = function (type) {
                $rootScope.$apply(function () {
                    $rootScope.$broadcast('openDialog_' + type);
                });
            };

            var openElementProjectionDiagram = function () {
                $rootScope.$apply(function () {
                    $rootScope.$broadcast('openElementProjectionModal');
                });
            };

            var openTraceDiagram = function () {
                $rootScope.$apply(function () {
                    $rootScope.$broadcast('openTraceDiagramModal');
                });
            };

            var windowMenu = new GUI.Menu({
                type: "menubar"
            });

            // File menu
            var fileMenu = new GUI.Menu();
            windowMenu.append(new GUI.MenuItem({
                label: 'File',
                submenu: fileMenu
            }));
            fileMenu.append(new GUI.MenuItem({
                label: 'Open Visualization'
            }));

            // Debug menu
            var debugMenu = new GUI.Menu();
            windowMenu.append(new GUI.MenuItem({
                label: 'Debug',
                submenu: debugMenu
            }));
            debugMenu.append(new GUI.MenuItem({
                label: 'DevTools',
                click: function () {
                    Window.showDevTools('', false)
                }
            }));

            // ProB menu
            var probMenu = new GUI.Menu();
            windowMenu.append(new GUI.MenuItem({
                label: 'ProB',
                submenu: probMenu
            }));
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

            // Diagram menu
            var diagramMenu = new GUI.Menu();
            windowMenu.append(new GUI.MenuItem({
                label: 'Diagram',
                submenu: diagramMenu
            }));
            diagramMenu.append(new GUI.MenuItem({
                label: 'Element Projection Diagram',
                click: function () {
                    openElementProjectionDiagram();
                },
                enabled: false
            }));
            diagramMenu.append(new GUI.MenuItem({
                label: 'Trace Diagram',
                click: function () {
                    openTraceDiagram();
                },
                enabled: false
            }));

            return {
                windowMenu: windowMenu,
                fileMenu: fileMenu,
                probMenu: probMenu,
                diagramMenu: diagramMenu
            };

        }])
        .factory('GUI', function () {
            return require('nw.gui');
        })
        .factory('Window', ['GUI', function (gui) {
            return gui.Window.get();
        }]);

    return module;

});