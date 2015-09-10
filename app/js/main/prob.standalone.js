/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['socketio', 'angularAMD', 'bms.func', 'jquery', 'bms.manifest', 'bms.config', 'angular', 'prob.graph', 'prob.iframe.template', 'prob.iframe.editor', 'prob.ui', 'prob.common', 'prob.modal', 'angular-route', 'prob.standalone.view', 'bms.electron', 'prob.standalone.menu'], function (io, angularAMD, bms, $) {

    var module = angular.module('prob.standalone', ['prob.standalone.view', 'bms.manifest', 'bms.config', 'prob.graph', 'prob.iframe.template', 'prob.iframe.editor', 'prob.ui', 'prob.common', 'prob.modal', 'bms.electron', 'prob.standalone.menu', 'ngRoute'])
        .config(['$routeProvider', '$locationProvider', function ($routeProvider) {
            $routeProvider
                .when('/startServer', {
                    template: '',
                    controller: 'bmsStartServerController'
                })
                .when('/welcome', {
                    templateUrl: 'resources/templates/bms-standalone-ui.html',
                    controller: 'bmsWelcomeController'
                })
                .when('/root/:sessionId/:win/:view', {
                    templateUrl: 'resources/templates/bms-standalone-view.html',
                    controller: 'bmsStandaloneRootViewCtrl'
                })
                .when('/root/:sessionId/:win', {
                    templateUrl: 'resources/templates/bms-standalone-view.html',
                    controller: 'bmsStandaloneRootViewCtrl'
                })
                .when('/:sessionId/:win/:view', {
                    templateUrl: 'resources/templates/bms-standalone-view.html',
                    controller: 'bmsStandaloneViewCtrl'
                })
                .otherwise({
                    redirectTo: '/startServer'
                });
        }])
        .run(['editableOptions', '$rootScope', 'bmsMainService', function (editableOptions, $rootScope, bmsMainService) {

            bmsMainService.mode = 'ModeStandalone';
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'

        }])
        .factory('initVisualisation', ['$q', '$location', 'ws', 'bmsManifestService', 'bmsMainService', 'bmsModalService', 'electronWindow', 'electronWindowService', function ($q, $location, ws, bmsManifestService, bmsMainService, bmsModalService, electronWindow, electronWindowService) {

            var initSession = function (manifestFilePath, manifestData) {

                var defer = $q.defer();

                var visualisationData = $.extend({
                    template: 'template.html',
                    name: 'MyVisualization',
                    tool: 'BAnimation',
                    manifest: manifestFilePath
                }, manifestData);

                ws.emit('initSession', {data: visualisationData}, function (r) {
                    if (r.errors) {
                        defer.reject(r.errors)
                    } else {
                        defer.resolve(r)
                    }
                });

                return defer.promise;

            };

            return function (manifestFilePath) {

                bmsModalService.loading("Initialising visualisation ...");

                bmsManifestService.validate(manifestFilePath).then(function (manifestData) {

                    initSession(manifestFilePath, manifestData).then(function (sessionId) {

                        var views = manifestData.views;
                        if (views) {

                            var aWindows = [];
                            var mainWindow = electronWindow.fromId(1);
                            mainWindow.on('close', function () {
                                angular.forEach(aWindows, function (w) {
                                    w.close();
                                });
                            });

                            // Open a new window for each view
                            angular.forEach(views, function (view, i) {
                                //var viewName = view.name ? view.name : view.id;
                                if (i === 0) {
                                    // TODO: I assume that the main window has always the id "1"
                                    $location.path('/root/' + sessionId + '/1/' + view.id);
                                    //win.title = 'BMotion Studio for ProB: ' + viewName;
                                } else {
                                    var newWindow = electronWindowService.createNewWindow();
                                    newWindow.loadUrl('file://' + __dirname + '/standalone.html#/' + sessionId + '/' + newWindow.id + '/' + view.id);
                                    aWindows.push(newWindow);
                                }
                                if (view.width && view.height) newWindow.setSize(view.width, view.height);
                            });
                        } else {
                            // Delegate to template view
                            $location.path('/root/' + sessionId + '/1');
                        }

                        bmsModalService.endLoading();

                    });

                }, function (error) {
                    bmsModalService.setError(error);
                });

            }

        }])
        .controller('bmsStartServerController', ['$scope', 'bmsModalService', '$location', 'bmsSocketService', '$q', 'bmsConfigService', 'ws', 'electronWindow', function ($scope, bmsModalService, $location, bmsSocketService, $q, bmsConfigService, ws, electronWindow) {

            bmsModalService.closeModal();

            var checkIfConnectionExists = function () {
                var defer = $q.defer();
                bmsSocketService.socket().then(function (socket) {
                    if (socket.connected) defer.resolve(true);
                    socket.on('connect_error', function () {
                        defer.resolve(false);
                    });
                    socket.on('connect_timeout', function () {
                        defer.resolve(false);
                    });
                    socket.on('connect', function () {
                        defer.resolve(true);
                    });
                }, function () {
                    defer.resolve(false);
                });
                return defer.promise;
            };

            var startServer = function (connected) {
                var defer = $q.defer();
                if (!connected) {
                    bmsModalService.setMessage("Start BMotion for ProB Server ...");
                    var exec = require('child_process').exec;
                    var path = require('path');
                    var nwPath = process.execPath;
                    var binaryPath = path.dirname(nwPath);
                    var separator = process.platform === 'win32' ? ';' : ':';
                    //var server = spawn('java', ['-Xmx1024m', '-cp', './libs/libs/*' + separator + './libs/bmotion-prob-standalone.jar', "-Dprob.home=./cli/", 'Start', '-standalone', '-local']);
                    //var server = exec('java', ['-Xmx1024m', '-cp', './libs/libs/*' + separator + './libs/bmotion-prob-standalone.jar', 'Start', '-standalone', '-local']);
                    //var server = exec('java -Xmx1024m -cp ' + binaryPath + '/libs/libs/*' + separator + binaryPath + '/libs/bmotion-prob-standalone.jar Start -standalone -local');
                    var server = exec('java -Xmx1024m -cp ' + binaryPath + '/libs/*' + separator + binaryPath + '/libs/bmotion-prob-0.2.2-SNAPSHOT.jar de.bms.prob.Standalone -standalone -local');
                    //var server = exec('java -Xmx1024m -cp ./libs/libs/*' + separator + './libs/bmotion-prob-standalone.jar -Dprob.home=./cli/ Start -standalone -local');
                    server.stdout.on('data', function (data) {
                        try {
                            var json = JSON.parse(data.toString('utf8'));
                            if (json) defer.resolve(json);
                        } catch (err) {
                            console.log(data.toString('utf8'));
                        }
                    });
                    server.stderr.on('data', function (data) {
                        console.log(data.toString('utf8'));
                    });
                    server.on('close', function (code) {
                        console.log('BMotion Studio for ProB Server process exited with code ' + code);
                    });
                } else {
                    defer.resolve();
                }
                return defer.promise;
            };

            var updateConfig = function (obj) {
                var defer = $q.defer();
                bmsConfigService.getConfig().then(function (config) {
                    if (obj) {
                        //config.socket.host = obj.host;
                        config.socket.port = obj.port;
                    }
                    defer.resolve();
                });
                return defer.promise;
            };

            var checkProbCli = function () {

                var defer = $q.defer();

                bmsModalService.loading("Check ProB binary ...");

                ws.emit('checkProBCli', {}, function (d) {

                    var version = d.version;
                    var revision = d.revision;
                    var dialogMessage;

                    bmsConfigService.getConfig().then(function (config) {
                        if (version === null) {
                            dialogMessage = "You have no ProB binaries installed in your home directory. " +
                                "Press \"Ok\" to download a compatible version. " +
                                "Make sure that you have a working internet connection.";
                        } else if (revision !== config.prob.revision) {
                            dialogMessage = "The ProB binary in your home directory may not be compatible with this version of BMotion Studio for ProB. " +
                                "Press \"Ok\" to download a compatible version. Make sure that you have a working internet connection. " +
                                "If you press \"Cancel\" we cannot guarantee that the plug-in will work correctly.";
                        } else {
                            defer.resolve();
                        }
                        if (dialogMessage) {
                            bmsModalService.openErrorDialog(dialogMessage)
                                .then(function () {
                                    bmsModalService.loading("Downloading ProB Cli ...");
                                    downloadProBCli().then(function (version) {
                                        defer.resolve(version);
                                    });
                                }, function () {
                                    defer.reject();
                                });
                        }
                    });

                });

                return defer.promise;

            };

            var downloadProBCli = function () {
                var defer = $q.defer();
                bmsConfigService.getConfig().then(function (config) {
                    ws.emit('downloadProBCli', {data: {version: config.prob.version}}, function (r) {
                        defer.resolve(r.version);
                    });
                });
                return defer.promise;
            };

            var finishLoading = function (version) {
                var defer = $q.defer();
                if (version) {
                    bmsModalService.openDialog(version)
                        .then(function () {
                            defer.resolve();
                        }, function () {
                            defer.resolve();
                        });
                } else {
                    defer.resolve();
                }
                return defer.promise;
            };

            bmsModalService.loading("Check if BMotion Studio for ProB Server exists ...");
            checkIfConnectionExists()
                .then(function (connected) {
                    return startServer(connected);
                })
                .then(function (obj) {
                    return updateConfig(obj);
                })
                .then(function () {
                    return checkProbCli();
                })
                .then(function (version) {
                    return finishLoading(version);
                })
                .then(function () {
                    bmsModalService.endLoading();
                    $location.path('/welcome');
                }, function () {
                    electronWindow.fromId(1).close();
                });

        }])
        .controller('bmsWelcomeController', ['$rootScope', 'electronMenuService', 'electronMenu', 'initVisualisation', 'electronWindow', function ($rootScope, electronMenuService, electronMenu, initVisualisation, electronWindow) {

            var mainWindow = electronWindow.fromId(1);
            var menu = electronMenuService.createNewMenu();
            electronMenuService.buildFileMenu(menu);
            electronMenuService.buildDebugMenu(menu);
            electronMenuService.buildHelpMenu(menu);
            mainWindow.setMenu(menu);

            $rootScope.$on('startVisualisationViaFileMenu', function (evt, manifestFilePath) {
                if (manifestFilePath) initVisualisation(manifestFilePath);
            });

        }])
        .controller('bmsDropZoneCtrl', ['initVisualisation', 'electronDialog', function (initVisualisation, electronDialog) {
            var self = this;
            self.openFileDialog = function () {
                electronDialog.showOpenDialog(
                    {
                        filters: [
                            {name: 'BMotion Studio File', extensions: ['json']}
                        ],
                        properties: ['openFile']
                    },
                    function (manifestFilePath) {
                        if (manifestFilePath) initVisualisation(manifestFilePath[0]);
                    });
            };
        }])
        .controller('bmsTabsCtrl', ['$scope', '$rootScope', 'bmsVisualizationService', function ($scope, $rootScope, bmsVisualizationService) {

            var self = this;

            self.lastTab = 'simulator';

            self.visualizationLoaded = function () {
                return bmsVisualizationService.getCurrentVisualizationId() !== undefined;
            };

            self.hasSvg = function () {
                return self.getSvg() !== undefined;
            };

            self.getSvg = function () {
                var vis = bmsVisualizationService.getCurrentVisualization();
                if (vis) return vis.svg;
            };

            self.getCurrentVisualizationId = function () {
                return bmsVisualizationService.getCurrentVisualizationId();
            };

            self.selectEditorTab = function (svg) {
                self.currentSvg = svg;
                self.lastTab = 'editor';
                $rootScope.$broadcast('hideDialog');
            };

            self.selectSimulatorTab = function () {
                if (self.lastTab === 'editor') {
                    $rootScope.$broadcast('saveVisualization', self.currentSvg);
                }
                self.lastTab = 'simulator';
                $rootScope.$broadcast('showDialog');
            };

        }])
        .directive('bmsDropZone', ['initVisualisation', function (initVisualisation) {
            return {
                link: function ($scope, element, attrs) {

                    // prevent default behavior from changing page on dropped file
                    window.ondragover = function (e) {
                        e.preventDefault();
                        return false
                    };
                    window.ondrop = function (e) {
                        e.preventDefault();
                        return false
                    };

                    var holder = element[0];
                    holder.ondragover = function () {
                        $(this).addClass('dragover');
                        return false;
                    };
                    holder.ondragleave = function () {
                        $(this).removeClass('dragover');
                        return false;
                    };
                    holder.ondrop = function (e) {
                        e.preventDefault();
                        $(this).removeClass('dragover');
                        if (e.dataTransfer.files.length > 0) {
                            var manifest = e.dataTransfer.files[0].path;
                            if (manifest) initVisualisation(manifest);
                        }
                        return false;
                    };

                }
            }
        }]);
    return angularAMD.bootstrap(module);

});