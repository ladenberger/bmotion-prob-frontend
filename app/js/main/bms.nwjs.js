/**
 * BMotion Studio Node Webkit Module
 *
 */
define(['angular'], function () {

    var module = angular.module('bms.nwjs', [])
        .factory('MenuService', ['GUI', 'Window', function (GUI, Window) {

            return {
                buildFileBMenu: function (menu) {
                    var fileMenu = new GUI.Menu();
                    menu.append(new GUI.MenuItem({
                        label: 'File',
                        submenu: fileMenu
                    }));
                    fileMenu.append(new GUI.MenuItem({
                        label: 'Open Visualization'
                    }));
                    return fileMenu;
                },
                buildDebugMenu: function (menu) {
                    var debugMenu = new GUI.Menu();
                    menu.append(new GUI.MenuItem({
                        label: 'Debug',
                        submenu: debugMenu
                    }));
                    debugMenu.append(new GUI.MenuItem({
                        label: 'DevTools',
                        click: function () {
                            Window.showDevTools('', false)
                        }
                    }));
                    return debugMenu;
                }
            }

        }])
        .factory('Menu', ['$rootScope', 'GUI', 'Window', function ($rootScope, GUI) {
            return {
                createNewMenu: function () {
                    return new GUI.Menu({
                        type: "menubar"
                    });
                }
            };
        }])
        .factory('GUI', function () {
            return require('nw.gui');
        })
        .factory('Window', ['GUI', function (gui) {
            return gui.Window.get();
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
        }]);

    return module;

});