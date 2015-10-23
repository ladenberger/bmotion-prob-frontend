'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
//var angular = require('./js/libs/bower/ng-electron/ng-bridge');
//var serverProcessId = null;
//var psTree = require('ps-tree');

// From http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
/*var kill = function (pid, signal, callback) {
 signal = signal || 'SIGKILL';
 callback = callback || function () {
 };
 var killTree = true;
 if (killTree) {
 psTree(pid, function (err, children) {
 [pid].concat(
 children.map(function (p) {
 return p.PID;
 })
 ).forEach(function (tpid) {
 try {
 process.kill(tpid, signal)
 }
 catch (ex) {
 }
 });
 callback();
 });
 } else {
 try {
 process.kill(pid, signal)
 }
 catch (ex) {
 }
 callback();
 }
 };*/

// Quit when all windows are closed and no other one is listening to this.
app.on('window-all-closed', function () {
    if (app.listeners('window-all-closed').length == 1)
        app.quit();
});

/*app.on('will-quit', function () {
 if (serverProcessId != null) {
 var isWin = /^win/.test(process.platform);
 if (!isWin) {
 kill(serverProcessId);
 } else {
 var cp = require('child_process');
 cp.exec('taskkill /PID ' + serverProcessId + ' /T /F', function (error, stdout, stderr) {
 });
 }
 }
 angular.send("stop");
 });*/

var mainWindow = null;

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        title: 'BMotion Studio for ProB',
        icon: __dirname + '/resources/icons/bmsicon16x16.png'
    });
    mainWindow.loadUrl('file://' + __dirname + '/standalone.html#/startServer');
    /*angular.listen(function (id) {
     serverProcessId = id;
     });*/
});