'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var angular = require('./js/libs/bower/ng-electron/ng-bridge');

// Quit when all windows are closed and no other one is listening to this.
app.on('window-all-closed', function () {
    if (app.listeners('window-all-closed').length == 1)
        app.quit();
});

var mainWindow = null;

var Menu = require('menu');
var MenuItem = require('menu-item');
var Dialog = require('dialog');

var openDialog = function (type) {
    angular.send({
        type: 'openDialog',
        data: type
    });
};

var buildHelpMenu = function (mainMenu) {

    // Help menu
    var helpMenu = new Menu();
    helpMenu.append(new MenuItem({
        label: 'About',
        click: function () {
            angular.send({
                type: 'openHelp',
                data: app.getVersion()
            });
        }
    }));
    mainMenu.append(new MenuItem({
        label: 'Help',
        submenu: helpMenu
    }));

};

var buildDebugMenu = function (mainMenu) {

    // Debug menu
    var debugMenu = new Menu();
    debugMenu.append(new MenuItem({
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
    debugMenu.append(new MenuItem({
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
    mainMenu.append(new MenuItem({
        label: 'Debug',
        submenu: debugMenu
    }));

};

var buildFileMenu = function (mainMenu) {

    // File menu
    var fileMenu = new Menu();
    fileMenu.append(new MenuItem({
        label: 'Open Visualization',
        accelerator: (function () {
            if (process.platform == 'darwin')
                return 'Alt+Command+O';
            else
                return 'Ctrl+Shift+O';
        })(),
        click: function () {
            Dialog.showOpenDialog(
                {
                    filters: [
                        {name: 'BMotion Studio File', extensions: ['json']}
                    ],
                    properties: ['openFile']
                },
                function (files) {
                    if (files) {
                        angular.send({
                            type: 'startVisualisationViaFileMenu',
                            data: files[0]
                        }, mainWindow);
                    }
                });
        }
    }));
    mainMenu.append(new MenuItem({
        label: 'File',
        submenu: fileMenu,
        visible: false
    }));

};

var buildProBMenu = function (mainMenu, tool, addMenu) {

    if (addMenu) buildFileMenu(mainMenu);

    // ProB Menu
    var probMenu = new Menu();
    probMenu.append(new MenuItem({
        label: 'Events',
        click: function () {
            openDialog('Events');
        }
    }));
    probMenu.append(new MenuItem({
        label: 'History',
        click: function () {
            openDialog('CurrentTrace');
        }
    }));
    probMenu.append(new MenuItem({
        label: 'State',
        click: function () {
            openDialog('StateInspector');
        }
    }));
    probMenu.append(new MenuItem({
        label: 'Animations',
        click: function () {
            openDialog('CurrentAnimations');
        }
    }));
    probMenu.append(new MenuItem({
        label: 'Model Checking',
        click: function () {
            openDialog('ModelCheckingUI');
        }
    }));

    mainMenu.append(new MenuItem({
        label: 'ProB',
        submenu: probMenu,
        visible: false
    }));

    // Diagram menu
    var diagramMenu = new Menu();
    diagramMenu.append(new MenuItem({
        label: 'Trace Diagram',
        click: function () {
            angular.send({
                type: 'openTraceDiagramModal'
            });
        }
    }));
    diagramMenu.append(new MenuItem({
        label: 'Element Projection Diagram',
        click: function () {
            angular.send({
                type: 'openElementProjectionModal'
            });
        },
        enabled: tool === 'BAnimation'
    }));

    mainMenu.append(new MenuItem({
        label: 'Diagram',
        submenu: diagramMenu
    }));

    buildDebugMenu(mainMenu);

    if (addMenu) buildHelpMenu(mainMenu);

};

var buildWelcomeMenu = function (mainMenu) {
    buildFileMenu(mainMenu);
    buildDebugMenu(mainMenu);
    buildHelpMenu(mainMenu);
};

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        title: 'BMotion Studio for ProB',
        icon: __dirname + '/resources/icons/bmsicon16x16.png'
    });
    mainWindow.loadUrl('file://' + __dirname + '/standalone.html#/startServer');

    var mainMenu = new Menu();
    buildDebugMenu(mainMenu);
    buildHelpMenu(mainMenu);
    mainWindow.setMenu(mainMenu);

    angular.listen(function (data) {
        if (data.type === 'buildWelcomeMenu') {
            var mainMenu = new Menu();
            buildWelcomeMenu(mainMenu);
            mainWindow.setMenu(mainMenu);
        } else if (data.type === 'buildProBMenu') {
            var mainMenu = new Menu();
            var win = BrowserWindow.fromId(data['win']);
            buildProBMenu(mainMenu, data['tool'], data['addMenu']);
            win.setMenu(mainMenu);
        }
    });

});