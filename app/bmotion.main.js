'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var angular = require('./js/libs/bower/ng-electron/ng-bridge');
var ncp = require('ncp').ncp;
ncp.limit = 16;

// Quit when all windows are closed and no other one is listening to this.
app.on('window-all-closed', function() {
  if (app.listeners('window-all-closed').length == 1)
    app.quit();
});

var mainWindow = null;

var Menu = require('menu');
var MenuItem = require('menu-item');
var Dialog = require('dialog');

var openDialog = function(type) {
  angular.send({
    type: 'openDialog',
    data: type
  });
};

var buildHelpMenu = function(mainMenu) {

  // Help menu
  var helpMenu = new Menu();
  helpMenu.append(new MenuItem({
    label: 'About',
    click: function() {
      angular.send({
        type: 'openHelp',
        data: app.getVersion()
      });
    }
  }));
  mainMenu.append(new MenuItem({
    label: 'Help',
    role: 'help',
    submenu: helpMenu
  }));

};

var buildViewMenu = function(mainMenu) {

  // Debug menu
  var viewMenu = new Menu();
  viewMenu.append(new MenuItem({
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function(item, focusedWindow) {
      if (focusedWindow)
        focusedWindow.reload();
    }
  }));
  viewMenu.append(new MenuItem({
    label: 'Open Groovy Console',
    click: function() {
      openDialog('GroovyConsoleSession');
    }
  }));
  viewMenu.append(new MenuItem({
    label: 'Toggle Full Screen',
    accelerator: (function() {
      if (process.platform == 'darwin')
        return 'Ctrl+Command+F';
      else
        return 'F11';
    })(),
    click: function(item, focusedWindow) {
      if (focusedWindow)
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
    }
  }));
  viewMenu.append(new MenuItem({
    label: 'Toggle Developer Tools',
    accelerator: (function() {
      if (process.platform == 'darwin')
        return 'Alt+Command+I';
      else
        return 'Ctrl+Shift+I';
    })(),
    click: function(item, focusedWindow) {
      if (focusedWindow)
        focusedWindow.toggleDevTools();
    }
  }));
  mainMenu.append(new MenuItem({
    label: 'View',
    submenu: viewMenu
  }));

};

var buildFileMenu = function(mainMenu) {

  // File menu
  var fileMenu = new Menu();
  fileMenu.append(new MenuItem({
    label: 'Open Visualization',
    accelerator: (function() {
      if (process.platform == 'darwin')
        return 'Alt+Command+O';
      else
        return 'Ctrl+Shift+O';
    })(),
    click: function() {
      Dialog.showOpenDialog({
          title: 'Open BMotion Studio Visualization',
          filters: [{
            name: 'BMotion Studio Visualization (*.json)',
            extensions: ['json']
          }, {
            name: 'Formal Model (*.mch, *.csp, *.bcm, *.bcc)',
            extensions: ['mch', 'csp', 'bcm', 'bcc']
          }],
          properties: ['openFile']
        },
        function(files) {
          if (files) {
            var filename = files[0].replace(/^.*[\\\/]/, '');
            var fileExtension = filename.split('.').pop();
            angular.send({
              type: fileExtension === 'json' ? 'startVisualisationViaFileMenu' : 'startFormalModelOnlyViaFileMenu',
              data: files[0]
            }, mainWindow);
          }
        });
    }
  }));
  fileMenu.append(new MenuItem({
    label: 'New Visualization',
    accelerator: (function() {
      if (process.platform == 'darwin')
        return 'Alt+Command+N';
      else
        return 'Ctrl+Shift+N';
    })(),
    click: function() {

      angular.send({
        type: 'createNewVisualization'
      }, mainWindow);


    }
  }));
  fileMenu.append(new MenuItem({
    type: 'separator'
  }));
  fileMenu.append(new MenuItem({
    label: 'Open Formal Model',
    click: function() {
      Dialog.showOpenDialog({
          title: 'Please select a formal model.',
          filters: [{
            name: 'Formal Model (*.mch, *.csp, *.bcm, *.bcc)',
            extensions: ['mch', 'csp', 'bcm', 'bcc']
          }],
          properties: ['openFile']
        },
        function(files) {
          if (files) {
            angular.send({
              type: 'startFormalModelOnlyViaFileMenu',
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

var buildDiagramMenu = function(mainMenu, tool) {

  // Diagram menu
  var diagramMenu = new Menu();
  diagramMenu.append(new MenuItem({
    label: 'Trace Diagram',
    accelerator: (function() {
      if (process.platform == 'darwin')
        return 'Alt+Command+T';
      else
        return 'Ctrl+Shift+T';
    })(),
    click: function() {
      angular.send({
        type: 'openTraceDiagramModal'
      });
    }
  }));
  diagramMenu.append(new MenuItem({
    label: 'Projection Diagram',
    accelerator: (function() {
      if (process.platform == 'darwin')
        return 'Alt+Command+P';
      else
        return 'Ctrl+Shift+P';
    })(),
    click: function() {
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

};

var buildVisualizationMenu = function(mainMenu, tool, addFileHelpMenu) {
  if (process.platform == 'darwin') buildOsxMenu(mainMenu);
  if (addFileHelpMenu) buildFileMenu(mainMenu);
  buildEditMenu(mainMenu);
  buildProBMenu(mainMenu);
  buildDiagramMenu(mainMenu, tool);
  buildViewMenu(mainMenu);
  if (addFileHelpMenu) buildHelpMenu(mainMenu);
  buildWindowMenu(mainMenu);
};

var buildModelMenu = function(mainMenu) {
  if (process.platform == 'darwin') buildOsxMenu(mainMenu);
  buildFileMenu(mainMenu);
  if (process.platform == 'darwin') buildEditMenu(mainMenu);
  buildProBMenu(mainMenu);
  buildViewMenu(mainMenu);
  buildHelpMenu(mainMenu);
  buildWindowMenu(mainMenu);
};

var buildProBMenu = function(mainMenu) {

  // ProB Menu
  var probMenu = new Menu();
  probMenu.append(new MenuItem({
    label: 'Events',
    click: function() {
      openDialog('Events');
    }
  }));
  probMenu.append(new MenuItem({
    label: 'History',
    click: function() {
      openDialog('CurrentTrace');
    }
  }));
  probMenu.append(new MenuItem({
    label: 'State',
    click: function() {
      openDialog('StateInspector');
    }
  }));
  probMenu.append(new MenuItem({
    label: 'Animations',
    click: function() {
      openDialog('CurrentAnimations');
    }
  }));
  probMenu.append(new MenuItem({
    label: 'Model Checking',
    click: function() {
      openDialog('ModelCheckingUI');
    }
  }));
  probMenu.append(new MenuItem({
    label: 'Console',
    click: function() {
      openDialog('BConsole');
    }
  }));

  mainMenu.append(new MenuItem({
    label: 'ProB',
    submenu: probMenu,
    visible: false
  }));

};

var buildWelcomeMenu = function(mainMenu) {
  if (process.platform == 'darwin') buildOsxMenu(mainMenu);
  buildFileMenu(mainMenu);
  if (process.platform == 'darwin') buildEditMenu(mainMenu);
  buildViewMenu(mainMenu);
  buildHelpMenu(mainMenu);
  buildWindowMenu(mainMenu);
};

var buildOsxMenu = function(mainMenu) {

  var name = require('app').getName();

  // OSX Menu
  var osxMenu = new Menu();
  osxMenu.append(new MenuItem({
    label: 'About ' + name,
    role: 'about'
  }));
  osxMenu.append(new MenuItem({
    type: 'separator'
  }));
  osxMenu.append(new MenuItem({
    label: 'Services',
    role: 'services'
  }));
  osxMenu.append(new MenuItem({
    type: 'separator'
  }));
  osxMenu.append(new MenuItem({
    label: 'Hide ' + name,
    accelerator: 'Command+H',
    role: 'hide'
  }));
  osxMenu.append(new MenuItem({
    label: 'Hide Others',
    accelerator: 'Command+Shift+H',
    role: 'hideothers'
  }));
  osxMenu.append(new MenuItem({
    label: 'Show All',
    role: 'unhide'
  }));
  osxMenu.append(new MenuItem({
    type: 'separator'
  }));
  osxMenu.append(new MenuItem({
    label: 'Quit',
    accelerator: 'Command+Q',
    click: function(item, focusedWindow) {
      if (focusedWindow)
        focusedWindow.close();
    }
  }));

  mainMenu.append(new MenuItem({
    label: name,
    submenu: osxMenu
  }));

};

var buildWindowMenu = function(mainMenu) {

  var windowMenu = new Menu();
  windowMenu.append(new MenuItem({
    label: 'Minimize',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize',
    click: function(item, focusedWindow) {
      if (focusedWindow)
        focusedWindow.minimize();
    }
  }));
  windowMenu.append(new MenuItem({
    label: 'Close',
    accelerator: 'CmdOrCtrl+W',
    role: 'close',
    click: function(item, focusedWindow) {
      if (focusedWindow)
        focusedWindow.close();
    }
  }));

  if (process.platform == 'darwin') {
    windowMenu.append(new MenuItem({
      type: 'separator'
    }));
    windowMenu.append(new MenuItem({
      label: 'Bring All to Front',
      role: 'front'
    }));
  }

  mainMenu.append(new MenuItem({
    label: 'Window',
    role: 'window',
    submenu: windowMenu
  }));

};

var buildStandardMenu = function(mainMenu) {
  if (process.platform == 'darwin') buildOsxMenu(mainMenu);
  if (process.platform == 'darwin') buildEditMenu(mainMenu);
  buildViewMenu(mainMenu);
  buildHelpMenu(mainMenu);
  buildWindowMenu(mainMenu);
};

var buildEditMenu = function(mainMenu) {

  var editMenu = new Menu();
  editMenu.append(new MenuItem({
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }));
  editMenu.append(new MenuItem({
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }));
  editMenu.append(new MenuItem({
    type: 'separator'
  }));
  editMenu.append(new MenuItem({
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }));
  editMenu.append(new MenuItem({
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }));
  editMenu.append(new MenuItem({
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }));
  editMenu.append(new MenuItem({
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }));

  mainMenu.append(new MenuItem({
    label: 'Edit',
    submenu: editMenu
  }));

};

app.on('ready', function() {

  var viewWindows;

  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    title: 'BMotion Studio for ProB',
    icon: __dirname + '/resources/icons/bmsicon16x16.png'
  });
  mainWindow.loadUrl('file://' + __dirname + '/standalone.html#/startServer');

  var closeViewWindows = function() {
    // Close all views of running visualization
    // if main window was closed
    if (viewWindows) {
      viewWindows.forEach(function(w) {
        var win = BrowserWindow.fromId(w);
        if (win) win.close();
      });
    }
  };

  mainWindow.on('close', function() {
    closeViewWindows();
  });

  var mainMenu = new Menu();
  buildStandardMenu(mainMenu);
  if (process.platform == 'darwin') {
    Menu.setApplicationMenu(mainMenu);
  } else {
    mainWindow.setMenu(mainMenu);
  }

  angular.listen(function(data) {
    if (data.type === 'buildWelcomeMenu') {
      var mainMenu = new Menu();
      buildWelcomeMenu(mainMenu);
      if (process.platform == 'darwin' && data['win'] === 1) {
        Menu.setApplicationMenu(mainMenu);
      } else {
        mainWindow.setMenu(mainMenu);
      }
    } else if (data.type === 'buildVisualizationMenu') {
      var mainMenu = new Menu();
      var win = BrowserWindow.fromId(data['win']);
      buildVisualizationMenu(mainMenu, data['tool'], data['addMenu']);
      if (process.platform == 'darwin' && data['win'] === 1) {
        Menu.setApplicationMenu(mainMenu);
      }
      win.setMenu(mainMenu);
    } else if (data.type === 'buildModelMenu') {
      var mainMenu = new Menu();
      var win = BrowserWindow.fromId(data['win']);
      buildModelMenu(mainMenu, data['tool'], data['addMenu']);
      if (process.platform == 'darwin' && data['win'] === 1) {
        Menu.setApplicationMenu(mainMenu);
      }
      win.setMenu(mainMenu);
    } else if (data.type === 'setWindows') {
      viewWindows = data.data;
    } else if (data.type === 'cleanUp') {
      closeViewWindows();
    }
  });

});
