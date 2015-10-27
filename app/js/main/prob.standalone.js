/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angular', 'socketio', 'angularAMD', 'bms.func', 'bms.common', 'bms.session', 'jquery', 'bms.manifest', 'bms.config', 'prob.graph', 'prob.iframe.template', 'prob.iframe.editor', 'prob.ui', 'prob.common', 'prob.modal', 'angular-route', 'prob.standalone.view', 'bms.electron', 'ng-electron'],
    function (angular, io, angularAMD, bms, $) {

        var module = angular.module('prob.standalone', ['prob.standalone.view', 'bms.manifest', 'bms.config', 'bms.common', 'bms.session', 'prob.graph', 'prob.iframe.template', 'prob.iframe.editor', 'prob.ui', 'prob.common', 'prob.modal', 'bms.electron', 'ngRoute', 'ngElectron'])
            .config(['$routeProvider', '$locationProvider',
                function ($routeProvider) {
                    $routeProvider
                        .when('/startServer', {
                            template: '',
                            controller: 'bmsStartServerController'
                        })
                        .when('/welcome', {
                            templateUrl: 'resources/templates/bms-standalone-ui.html',
                            controller: 'bmsWelcomeController'
                        })
                        .when('/root/:sessionId/:win/:view/:file', {
                            templateUrl: 'resources/templates/bms-standalone-view.html',
                            controller: 'bmsStandaloneRootViewCtrl'
                        })
                        .when('/root/:sessionId/:win/:file', {
                            templateUrl: 'resources/templates/bms-standalone-view.html',
                            controller: 'bmsStandaloneRootViewCtrl'
                        })
                        .when('/:sessionId/:win/:view/:file', {
                            templateUrl: 'resources/templates/bms-standalone-view.html',
                            controller: 'bmsStandaloneViewCtrl'
                        })
                        .otherwise({
                            redirectTo: '/startServer'
                        });
                }])
            .run(['$rootScope', 'bmsMainService', 'bmsConfigService', 'bmsModalService', 'initVisualizationService',
                function ($rootScope, bmsMainService, bmsConfigService, bmsModalService, initVisualizationService) {

                    bmsMainService.mode = 'ModeStandalone';
                    //editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'

                    // Delegate calls from electron main process
                    $rootScope.$on('electron-host', function (evt, data) {
                        if (data.type === 'startVisualisationViaFileMenu') {
                            initVisualizationService(data.data);
                        } else if (data.type === 'openDialog') {
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('openDialog_' + data.data);
                            });
                        } else if (data.type === 'openTraceDiagramModal') {
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('openTraceDiagramModal');
                            });
                        } else if (data.type === 'openElementProjectionModal') {
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('openElementProjectionModal');
                            });
                        } else if (data.type === 'openHelp') {
                            bmsConfigService.getConfig()
                                .then(function (config) {
                                    bmsModalService.openDialog("<p>BMotion Studio for ProB (version " + data.data + ")</p>" +
                                        "<p>ProB 2.0 (version " + config.prob.version + ")</p>" +
                                        "<p>" + config.prob.revision + "</p>");
                                });
                        }
                    });

                }])
            .factory('initVisualizationService', ['$location', 'bmsInitSessionService', 'bmsManifestService', 'bmsMainService', 'bmsModalService', 'electronWindow', 'electronWindowService',
                function ($location, bmsInitSessionService, bmsManifestService, bmsMainService, bmsModalService, electronWindow, electronWindowService) {

                    return function (manifestFilePath) {

                        bmsModalService.loading("Initialising visualisation ...");

                        bmsManifestService.validate(manifestFilePath)
                            .then(function (manifestData) {
                                bmsInitSessionService(manifestFilePath, manifestData)
                                    .then(function (sessionId) {
                                        var views = manifestData.views;
                                        if (views) {
                                            var aWindows = [];
                                            var mainWindow = electronWindow.fromId(1);
                                            mainWindow.on('close', function () {
                                                angular.forEach(aWindows, function (w) {
                                                    w.close();
                                                });
                                            });
                                            var filename = manifestFilePath.replace(/^.*[\\\/]/, '');
                                            // Open a new window for each view
                                            angular.forEach(views, function (view, i) {
                                                //var viewName = view.name ? view.name : view.id;
                                                if (i === 0) {
                                                    // TODO: I assume that the main window has always the id "1"
                                                    $location.path('/root/' + sessionId + '/1/' + view.id + '/' + filename);
                                                    newWindow = mainWindow;
                                                    //win.title = 'BMotion Studio for ProB: ' + viewName;
                                                } else {
                                                    var newWindow = electronWindowService.createNewWindow();
                                                    newWindow.loadUrl('file://' + __dirname + '/standalone.html#/' + sessionId + '/' + newWindow.id + '/' + view.id + '/' + filename);
                                                    aWindows.push(newWindow);
                                                }
                                                if (view.width && view.height) newWindow.setSize(view.width, view.height);
                                            });
                                        } else {
                                            // Delegate to template view
                                            $location.path('/root/' + sessionId + '/1');
                                        }
                                        bmsModalService.endLoading();
                                    }, function (errors) {
                                        bmsModalService.openErrorDialog(errors);
                                    });
                            }, function (error) {
                                bmsModalService.openErrorDialog(error);
                            });

                    }

                }])
            .controller('bmsStartServerController', ['$rootScope', '$scope', 'bmsModalService', '$location', 'bmsSocketService', '$q', 'bmsConfigService', 'ws', 'electronWindow',
                function ($rootScope, $scope, bmsModalService, $location, bmsSocketService, $q, bmsConfigService, ws, electronWindow) {

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

                    var startServer = function (connected, configData) {

                        var defer = $q.defer();

                        if (!connected) {

                            var probBinary = configData['prob']['binary'];
                            var exec = require('child_process').exec;
                            var path = require('path');
                            var appPath = path.dirname(__dirname);
                            var isWin = /^win/.test(process.platform);
                            var separator = isWin ? ';' : ':';
                            var server = exec('java -Xmx1024m -cp ' + appPath + '/libs/*' + separator + appPath + '/libs/bmotion-prob-0.2.2-SNAPSHOT.jar -Dprob.home=' + probBinary + ' de.bms.prob.Standalone -standalone -local');
                            //electron.send(server.pid);
                            server.stdout.on('data', function (data) {
                                try {
                                    var json = JSON.parse(data.toString('utf8'));
                                    if (json) {
                                        configData['socket']['port'] = json['port'];
                                        defer.resolve();
                                    }
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

                    var checkProbCli = function (configData) {

                        var defer = $q.defer();

                        bmsModalService.loading("Check ProB binary ...");

                        ws.emit('checkProBCli', {}, function (d) {

                            var version = d.version;
                            var revision = d.revision;

                            if (version === null) {
                                defer.reject("No ProB binaries found at " + configData['prob']['binary'] + ".");
                            } else if (revision !== configData['prob']['revision']) {
                                defer.reject("The ProB binary at " + configData['prob']['binary'] + " [version " + version + "] " +
                                    "may not be compatible with this version of BMotion Studio for ProB. " +
                                    "Please make sure that you have installed the correct version of the " +
                                    "Prob binary [version " + configData['prob']['version'] + " (" + configData['prob']['revision'] + ")].");
                            } else {
                                defer.resolve();
                            }

                        });

                        return defer.promise;

                    };

                    var initBMotionStudio = function () {

                        var defer = $q.defer();

                        bmsModalService.loading("Starting BMotion Studio for ProB ...");

                        bmsConfigService.getConfig()
                            .then(function (configData) {
                                checkIfConnectionExists()
                                    .then(function (connected) {
                                        startServer(connected, configData)
                                            .then(function () {
                                                return checkProbCli(configData);
                                            })
                                            .then(function () {
                                                defer.resolve();
                                            }, function (error) {
                                                defer.reject(error);
                                            });
                                    });
                            }, function (error) {
                                defer.reject(error);
                            });

                        return defer.promise;

                    };

                    initBMotionStudio()
                        .then(function () {
                            bmsModalService.endLoading();
                            $location.path('/welcome');
                        }, function (error) {
                            bmsModalService.openErrorDialog(error)
                                .then(function () {
                                    electronWindow.fromId(1).close();
                                }, function () {
                                    electronWindow.fromId(1).close();
                                });
                        });

                    /*var downloadProBCli = function () {
                     var defer = $q.defer();
                     bmsConfigService.getConfig().then(function (config) {
                     ws.emit('downloadProBCli', {data: {version: config.prob.version}}, function (r) {
                     defer.resolve(r.version);
                     });
                     });
                     return defer.promise;
                     };*/

                }
            ])
            .controller('bmsWelcomeController', ['electron',
                function (electron) {
                    electron.send({
                        type: "buildWelcomeMenu"
                    });
                }])
            .controller('bmsDropZoneCtrl', ['initVisualizationService', 'electronDialog',
                function (initVisualizationService, electronDialog) {
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
                                if (manifestFilePath) initVisualizationService(manifestFilePath[0]);
                            });
                    };
                }])
            .controller('bmsTabsCtrl', ['$scope', '$rootScope', 'bmsVisualizationService', 'bmsModalService',
                function ($scope, $rootScope, bmsVisualizationService, bmsModalService) {

                    var self = this;

                    var disabledTabs = bmsVisualizationService.getDisabledTabs();

                    self.lastTab = 'simulator';

                    self.isDisabled = function (svg) {
                        return disabledTabs[svg] === undefined ? false : disabledTabs[svg]['status'];
                    };

                    self.whyDisabled = function (svg) {
                        if (disabledTabs[svg] !== undefined && disabledTabs[svg]['status']) {
                            bmsModalService.openErrorDialog(disabledTabs[svg]['reason']);
                        }
                    };

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
                        /*if (self.lastTab === 'editor') {
                         $rootScope.$broadcast('saveVisualization', self.currentSvg);
                         }*/
                        self.lastTab = 'simulator';
                        $rootScope.$broadcast('showDialog');
                    };

                }])
            .directive('bmsDropZone', ['initVisualizationService',
                function (initVisualizationService) {
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
                                    if (manifest) initVisualizationService(manifest);
                                }
                                return false;
                            };

                        }
                    }
                }]);
        return angularAMD.bootstrap(module);

    });