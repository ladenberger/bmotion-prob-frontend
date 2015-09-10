'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');

// Quit when all windows are closed and no other one is listening to this.
app.on('window-all-closed', function() {
    if (app.listeners('window-all-closed').length == 1)
        app.quit();
});

var mainWindow = null;

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        title: 'BMotion Studio for ProB',
        icon: __dirname + '/resources/icons/bmsicon16x16.png'
    });
    mainWindow.loadUrl('file://' + __dirname + '/standalone.html#/startServer');
});