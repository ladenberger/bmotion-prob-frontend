/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['socketio', 'angularAMD', 'bms.func', 'bms.manifest', 'bms.config', 'angular', 'prob.graph', 'prob.iframe.template', 'prob.iframe.editor', 'prob.ui', 'prob.common', 'prob.modal', 'angular-route', 'prob.standalone.view', 'bms.nwjs', 'prob.standalone.menu'], function (io, angularAMD, bms) {

    var module = angular.module('prob.standalone', ['prob.standalone.view', 'bms.manifest', 'bms.config', 'prob.graph', 'prob.iframe.template', 'prob.iframe.editor', 'prob.ui', 'prob.common', 'prob.modal', 'bms.nwjs', 'prob.standalone.menu', 'ngRoute'])
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
                .when('/root/:sessionId/:view', {
                    templateUrl: 'resources/templates/bms-standalone-view.html',
                    controller: 'bmsStandaloneRootViewCtrl'
                })
                .when('/:sessionId', {
                    templateUrl: 'resources/templates/bms-standalone-view.html',
                    controller: 'bmsStandaloneViewCtrl'
                })
                .when('/:sessionId/:view', {
                    templateUrl: 'resources/templates/bms-standalone-view.html',
                    controller: 'bmsStandaloneViewCtrl'
                })
                .otherwise({
                    redirectTo: '/startServer'
                });
        }])
        .run(['editableOptions', '$rootScope', 'bmsMainService', 'Menu', 'Window', 'fileDialogService', 'initVisualisation', 'bmsMenuService', 'probStandaloneMenuService', function (editableOptions, $rootScope, bmsMainService, Menu, Window, fileDialogService, initVisualisation, bmsMenuService, probStandaloneMenuService) {

            bmsMainService.mode = 'ModeStandalone';
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
            var menu = Menu.createNewMenu();
            bmsMenuService.buildFileBMenu(menu);
            probStandaloneMenuService.buildProBDebugMenu(menu);
            Window.menu = menu;

            $rootScope.$on('openVisualizationViaFileMenu', function () {
                fileDialogService.open().then(function (manifestFilePath) {
                    initVisualisation(manifestFilePath);
                });
            });

        }])
        .factory('initVisualisation', ['$q', '$location', 'ws', 'bmsManifestService', 'bmsMainService', 'bmsModalService', 'GUI', function ($q, $location, ws, bmsManifestService, bmsMainService, bmsModalService, GUI) {

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

                bmsModalService.startLoading("Initialising visualisation ...");

                bmsManifestService.validate(manifestFilePath).then(function (manifestData) {

                    initSession(manifestFilePath, manifestData).then(function (sessionId) {

                        var views = manifestData.views;
                        if (views) {
                            // Open a new window for each view
                            var aWindows = [];
                            var win = GUI.Window.get();
                            win.on('closed', function () {
                                angular.forEach(aWindows, function (w) {
                                    w.close(true);
                                });
                            });
                            angular.forEach(views, function (view, i) {
                                var viewName = view.name ? view.name : view.id;
                                if (i === 0) {
                                    $location.path('/root/' + sessionId + '/' + view.id);
                                    win.title = 'BMotion Studio for ProB: ' + viewName;
                                } else {
                                    win = GUI.Window.open('standalone.html#/' + sessionId + '/' + view.id, {
                                        title: 'BMotion Studio for ProB: ' + viewName,
                                        icon: 'bmsicon.png'
                                    });
                                    aWindows.push(win);
                                }
                                if (view.width && view.height) win.resizeTo(view.width, view.height);
                            });
                        } else {
                            // Delegate to template view
                            $location.path('/' + sessionId);
                        }

                        /*.search({
                         //sessionId: sessionId,
                         //template: manifestData.template
                         });*/

                        bmsModalService.endLoading();

                    });

                }, function (error) {
                    bmsModalService.setError(error);
                });

            }

        }])
        .controller('bmsStartServerController', ['$scope', 'Menu', 'bmsModalService', '$location', 'bmsSocketService', '$q', 'bmsConfigService', 'Window', 'GUI', 'ws', function ($scope, Menu, bmsModalService, $location, bmsSocketService, $q, bmsConfigService, Window, GUI, ws) {

            var win = GUI.Window.get();
            win.title = "BMotion Studio for ProB";

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
                    var binaryPath = process.cwd();
                    var separator = process.platform === 'win32' ? ';' : ':';
                    //var server = spawn('java', ['-Xmx1024m', '-cp', './libs/libs/*' + separator + './libs/bmotion-prob-standalone.jar', "-Dprob.home=./cli/", 'Start', '-standalone', '-local']);
                    //var server = exec('java', ['-Xmx1024m', '-cp', './libs/libs/*' + separator + './libs/bmotion-prob-standalone.jar', 'Start', '-standalone', '-local']);
                    var server = exec('java -Xmx1024m -cp ' + binaryPath + '/libs/libs/*' + separator + binaryPath + '/libs/bmotion-prob-standalone.jar Start -standalone -local');
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

                bmsModalService.setMessage("Check ProB cli ...");

                ws.emit('checkProBCli', {}, function (d) {

                    var version = d.version;

                    if (version === null) {
                        var dialogMessage = "You have no ProB binaries installed in your home directory. " +
                            "Press \"Ok\" to download a compatible version. " +
                            "Make sure that you have a working internet connection.\n";
                        bmsModalService.openErrorDialog(dialogMessage)
                            .then(function () {
                                bmsModalService.startLoading("Downloading ProB Cli ...");
                                downloadProBCli().then(function (version) {
                                    defer.resolve(version);
                                });
                            }, function () {
                                defer.reject();
                            });
                    } else {
                        defer.resolve();
                    }

                });

                return defer.promise;

            };

            var downloadProBCli = function () {
                var defer = $q.defer();
                ws.emit('downloadProBCli', {}, function (r) {
                    defer.resolve(r.version);
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

            bmsModalService.startLoading("Check if BMotion Studio for ProB Server exists ...");
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
                    var win = GUI.Window.get();
                    win.close(true);
                });

        }])
        .controller('bmsWelcomeController', ['$rootScope', 'Menu', 'initVisualisation', 'GUI', 'Window', 'fileDialogService', function ($rootScope, Menu, initVisualisation, GUI, Window, fileDialogService) {
        }])
        .controller('bmsDropZoneCtrl', ['fileDialogService', 'initVisualisation', function (fileDialogService, initVisualisation) {
            var self = this;
            self.openFileDialog = function () {
                fileDialogService.open().then(function (manifestFilePath) {
                    initVisualisation(manifestFilePath);
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
        .directive('bmsDropZone', ['$http', 'bmsModalService', function ($http, bmsModalService) {
            return {
                link: function ($scope, element) {

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
                            //TODO: Check if correct file ...
                            var filename = manifest.replace(/^.*[\\\/]/, '');
                            if (filename === 'bmotion.json') {
                                $http.get(manifest).success(function () {
                                    $scope.$emit('openManifest', manifest);
                                });
                            } else {
                                bmsModalService.setError('Invalid file, please drop a bmotion.json file!');
                            }
                        }
                        return false;
                    };

                }
            }
        }]);
    return angularAMD.bootstrap(module);

});