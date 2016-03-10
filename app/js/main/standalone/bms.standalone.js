/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angular', 'jquery', 'socketio', 'angularAMD', 'bms.func', 'bms.observers', 'bms.handlers', 'bms.api.extern', 'bms.tabs', 'bms.common', 'bms.session', 'bms.manifest', 'bms.config', 'prob.graph', 'prob.iframe.editor', 'prob.ui', 'prob.modal', 'bms.views.user.interactions', 'angular-route', 'bms.directive', 'bms.standalone.vis.view', 'bms.standalone.model.view', 'bms.electron', 'bms.nodejs', 'ng-electron'],
  function(angular, $, io, angularAMD, bms) {

    var module = angular.module('prob.standalone', ['bms.observers', 'bms.handlers', 'prob.standalone.vis.view', 'prob.standalone.model.view', 'bms.tabs', 'bms.manifest', 'bms.config', 'bms.common', 'bms.session', 'prob.graph', 'bms.directive', 'prob.iframe.editor', 'prob.ui', 'bms.views.user.interactions', 'prob.modal', 'bms.electron', 'bms.nodejs', 'ngRoute', 'ngElectron'])
      .config(['$routeProvider', '$locationProvider',
        function($routeProvider) {
          $routeProvider
            .when('/startServer', {
              template: '',
              controller: 'bmsStartServerController'
            })
            .when('/welcome', {
              templateUrl: 'resources/templates/bms-standalone-ui.html',
              controller: 'bmsWelcomeController'
            })
            .when('/vis/root/:sessionId/:win/:view/:file', {
              templateUrl: 'resources/templates/bms-standalone-vis-view.html',
              controller: 'bmsStandaloneRootViewCtrl'
            })
            .when('/vis/root/:sessionId/:win/:file', {
              templateUrl: 'resources/templates/bms-standalone-vis-view.html',
              controller: 'bmsStandaloneRootViewCtrl'
            })
            .when('/vis/:sessionId/:win/:view/:file', {
              templateUrl: 'resources/templates/bms-standalone-vis-view.html',
              controller: 'bmsStandaloneViewCtrl'
            })
            .when('/model/:sessionId/:win/:tool', {
              templateUrl: 'resources/templates/bms-standalone-model-view.html',
              controller: 'bmsModelViewCtrl'
            })
            .otherwise({
              redirectTo: '/startServer'
            });
        }
      ])
      .run(['$rootScope', 'bmsTabsService', 'bmsMainService', 'bmsConfigService', 'bmsModalService', 'initVisualizationService', 'createVisualizationService', 'initFormalModelOnlyService',
        function($rootScope, bmsTabsService, bmsMainService, bmsConfigService, bmsModalService, initVisualizationService, createVisualizationService, initFormalModelOnlyService) {

          bmsMainService.mode = 'ModeStandalone';
          //editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'

          // Delegate calls from electron main process
          $rootScope.$on('electron-host', function(evt, data) {
            if (data.type === 'startVisualisationViaFileMenu') {
              initVisualizationService(data.data);
            } else if (data.type === 'startFormalModelOnlyViaFileMenu') {
              initFormalModelOnlyService(data.data);
            } else if (data.type === 'openDialog') {
              $rootScope.$apply(function() {
                $rootScope.$broadcast('openDialog_' + data.data);
              });
            } else if (data.type === 'openTraceDiagramModal') {
              $rootScope.$apply(function() {
                bmsTabsService.addTraceDiagramTab();
              });
            } else if (data.type === 'openElementProjectionModal') {
              $rootScope.$apply(function() {
                bmsTabsService.addProjectionDiagramTab();
              });
            } else if (data.type === 'openHelp') {
              bmsConfigService.getConfig()
                .then(function(config) {
                  bmsModalService.openDialog("<p>BMotion Studio for ProB (version " + data.data + ")</p>" +
                    "<p>ProB 2.0 (version " + config.prob.version + ")</p>" +
                    "<p>" + config.prob.revision + "</p>");
                });
            } else if (data.type === 'showError') {
              bmsMainService.openErrorDialog(data.data);
            } else if (data.type === 'createNewVisualization') {
              createVisualizationService();
            }
          });

        }
      ])
      .factory('createVisualizationService', ['$uibModal', '$q', 'electronDialog', 'fs', 'path', 'ncp', 'initVisualizationService',
        function($uibModal, $q, electronDialog, fs, path, ncp, initVisualizationService) {

          var createJsonFile = function(folder, file, json) {
            var defer = $q.defer();
            fs.writeFile(folder + '/' + file, JSON.stringify(json, null, "    "),
              function(err) {
                if (err) {
                  defer.reject(err);
                } else {
                  defer.resolve(file);
                }
              });
            return defer.promise;
          }

          return function() {

            var modalInstance = $uibModal.open({
              templateUrl: 'resources/templates/bms-create-visualization.html',
              controller: function($scope, $modalInstance) {

                $scope.close = function() {
                  $modalInstance.close();
                };

                $scope.ok = function() {

                  $scope.$broadcast('show-errors-check-validity');

                  if ($scope.userForm.$valid) {
                    $modalInstance.close($scope.view);
                  }

                };

                $scope.cancel = function() {
                  $modalInstance.dismiss('cancel');
                };

              },
              resolve: {},
              backdrop: false
            });
            modalInstance.result.then(function(view) {

                electronDialog.showOpenDialog({
                    title: 'Please select a folder where the BMotion Studio visualization should be saved.',
                    properties: ['openDirectory', 'createDirectory']
                  },
                  function(files) {

                    if (files) {

                      var folder = files[0];
                      var appPath = path.dirname(__dirname);
                      var templateFolder = appPath + '/template';
                      ncp(templateFolder, folder, function(err) {

                        if (err) {
                          bmsModalService.openErrorDialog(err);
                        } else {

                          view.template = 'index.html';
                          view.observers = view.id + '.observers.json';
                          view.events = view.id + '.events.json';
                          var manifestFile = 'bmotion.json';

                          createJsonFile(folder, view.observers, {
                              observers: []
                            })
                            .then(function() {
                              return createJsonFile(folder, view.events, {
                                events: []
                              });
                            })
                            .then(function() {
                              return createJsonFile(folder, manifestFile, {
                                views: [view]
                              });
                            })
                            .then(function() {
                              initVisualizationService(folder + '/' + manifestFile);
                            }, function(err) {
                              bmsModalService.openErrorDialog("An error occurred while writing file: " + err);
                            });

                        }

                      });

                    }

                  });

              },
              function() {});

          }

        }
      ])
      .factory('initFormalModelOnlyService', ['bmsSessionService', 'bmsModalService', '$location',
        function(bmsSessionService, bmsModalService, $location) {

          return function(modelPath) {

            bmsModalService.loading("Initialising Formal Model ...");

            var filename = modelPath.replace(/^.*[\\\/]/, '');
            var fileExtension = filename.split('.').pop();
            var tool = fileExtension === 'csp' ? 'CSPAnimation' : 'BAnimation';

            bmsSessionService.initFormalModelOnlySession(modelPath, {
                preferences: {}
              })
              .then(function(sessionId) {
                $location.path('/model/' + sessionId + '/1/' + tool);
                bmsModalService.endLoading();
              });

          }

        }
      ])
      .factory('openModelService', ['electronDialog', '$q', '$uibModal',
        function(electronDialog, $q, $uibModal) {

          return function() {

            var defer = $q.defer();

            var modalInstance = $uibModal.open({
              templateUrl: 'resources/templates/bms-open-model.html',
              controller: function($scope, $modalInstance) {

                $scope.openModel = function() {

                  electronDialog.showOpenDialog({
                      title: 'Please select a model.',
                      filters: [{
                        name: 'Model (*.mch, *.csp, *.bcm)',
                        extensions: ['mch', 'csp', 'bcm']
                      }],
                      properties: ['openFile']
                    },
                    function(files) {

                      if (files) {

                        var modelPath = files[0];
                        $scope.$apply(function() {
                          $scope.model = modelPath;
                        });

                      }

                    }
                  );

                };

                $scope.close = function() {
                  $scope.$broadcast('show-errors-check-validity');
                  if ($scope.userForm.$valid) {
                    // TODO: RETURN DATA
                    $modalInstance.close($scope.model);
                  }
                };

                $scope.ok = function() {
                  $scope.close();
                };

                $scope.cancel = function() {
                  $modalInstance.dismiss('cancel');
                };

              },
              resolve: {},
              backdrop: false
            });
            modalInstance.result.then(function(model) {
              defer.resolve(model);
            }, function() {
              defer.reject("Please select a model to start the visualization.");
            });

            return defer.promise;

          }

        }
      ])
      .factory('initVisualizationService', ['$q', '$location', '$routeParams', 'bmsSessionService', 'bmsManifestService', 'bmsMainService', 'bmsModalService', 'electronWindow', 'electronWindowService', 'electron', 'openModelService',
        function($q, $location, $routeParams, bmsSessionService, bmsManifestService, bmsMainService, bmsModalService, electronWindow, electronWindowService, electron, openModelService) {

          var getModel = function(modelPath) {
            var defer = $q.defer();
            if (!modelPath) {
              defer.resolve(openModelService());
            } else {
              defer.resolve(modelPath);
            }
            return defer.promise;
          };

          var initVisualizationSession = function(modelPath, options, manifestFilePath) {
            var defer = $q.defer();
            getModel(modelPath)
              .then(function(finalModelPath) {
                bmsSessionService.init(finalModelPath, options, manifestFilePath)
                  .then(function(data) {
                    defer.resolve(data);
                  }, function(errors) {
                    defer.reject(errors);
                  });
              }, function(errors) {
                defer.reject(errors);
              });
            return defer.promise;
          };

          return function(manifestFilePath) {

            bmsModalService.loading("Initialising visualization ...");

            electron.send({
              type: "cleanUp"
            });

            bmsManifestService.validate(manifestFilePath)
              .then(function(manifestData) {
                return bmsManifestService.normalize(manifestData);
              }, function(errors) {
                bmsModalService.openErrorDialog(errors);
                throw errors;
              })
              .then(function(normalizedManifestData) {

                // Destroy current session in standalone mode (if exists)
                if ($routeParams.sessionId) {
                  bmsSessionService.destroy($routeParams.sessionId);
                }

                initVisualizationSession(normalizedManifestData['model'], normalizedManifestData['prob'], manifestFilePath)
                  .then(function(sessionId) {
                    var filename = manifestFilePath.replace(/^.*[\\\/]/, '');
                    var views = normalizedManifestData['views'];
                    if (views) {
                      var aWindows = [];
                      var mainWindow = electronWindow.fromId(1);
                      // Open a new window for each view
                      angular.forEach(views, function(view, i) {
                        if (i === 0) {
                          // TODO: I assume that the main window has always the id "1"
                          $location.path('/vis/root/' + sessionId + '/1/' + view.id + '/' + filename);
                          newWindow = mainWindow;
                        } else {
                          var newWindow = electronWindowService.createNewWindow();
                          newWindow.loadUrl('file://' + __dirname + '/standalone.html#/vis/' + sessionId + '/' + newWindow.id + '/' + view.id + '/' + filename);
                          aWindows.push(newWindow.id);
                        }
                        if (view.width && view.height) newWindow.setSize(view.width, view.height);
                      });
                      electron.send({
                        type: "setWindows",
                        data: aWindows
                      });
                    } else {
                      // Delegate to template view
                      $location.path('/vis/root/' + sessionId + '/1/' + filename);
                    }
                    bmsModalService.endLoading();
                  }, function(errors) {
                    bmsModalService.openErrorDialog(errors);
                  });

              });

          }

        }
      ])
      .controller('bmsStartServerController', ['$rootScope', '$scope', 'bmsModalService', '$location', 'bmsSocketService', '$q', 'bmsConfigService', 'ws', 'electronWindow',
        function($rootScope, $scope, bmsModalService, $location, bmsSocketService, $q, bmsConfigService, ws, electronWindow) {

          bmsModalService.closeModal();

          var checkIfConnectionExists = function() {
            var defer = $q.defer();
            bmsSocketService.socket()
              .then(function(socket) {
                if (socket.connected) defer.resolve(true);
                socket.on('connect_error', function() {
                  defer.resolve(false);
                });
                socket.on('connect_timeout', function() {
                  defer.resolve(false);
                });
                socket.on('connect', function() {
                  defer.resolve(true);
                });
              }, function() {
                defer.resolve(false);
              });
            return defer.promise;
          };

          var startServer = function(connected, configData) {

            var defer = $q.defer();

            var path = require('path');
            var appPath = path.dirname(__dirname);
            var probBinary;
            if (configData['prob']['binary'] === undefined) {
              configData['prob']['binary'] = appPath + '/cli/';
              probBinary = appPath + '/cli/';
            }

            if (!connected) {

              var exec = require('child_process').exec;
              var isWin = /^win/.test(process.platform);
              var separator = isWin ? ';' : ':';
              //var server = exec('java -Xmx1024m -cp ' + appPath + '/libs/*' + separator + appPath + '/libs/bmotion-prob-0.2.8.jar -Dprob.home=' + probBinary + ' de.bms.prob.Standalone -standalone -local');
              var server = exec('java -Xmx1024m -cp ' + appPath + '/libs/*' + separator + appPath + '/libs/bmotion-prob-0.2.8.jar de.bms.prob.Standalone -standalone -local');
              //electron.send(server.pid);
              server.stdout.on('data', function(data) {
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
              server.stderr.on('data', function(data) {
                console.log(data.toString('utf8'));
              });
              server.on('close', function(code) {
                console.log('BMotion Studio for ProB Server process exited with code ' + code);
              });

            } else {
              defer.resolve();
            }

            return defer.promise;

          };

          var checkProbCli = function(configData) {

            var defer = $q.defer();

            bmsModalService.loading("Check ProB binary ...");

            ws.emit('checkProBCli', {}, function(d) {

              var version = d.version;
              var revision = d.revision;

              if (version === null) {
                defer.reject("No ProB binaries found.");
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

          var initBMotionStudio = function() {

            var defer = $q.defer();

            bmsModalService.loading("Starting BMotion Studio for ProB ...");

            bmsConfigService.getConfig()
              .then(function(configData) {
                checkIfConnectionExists()
                  .then(function(connected) {
                    startServer(connected, configData)
                      //.then(function() {
                      //  return checkProbCli(configData);
                      //})
                      .then(function() {
                        defer.resolve();
                      }, function(error) {
                        defer.reject(error);
                      });
                  });
              }, function(error) {
                defer.reject(error);
              });

            return defer.promise;

          };

          initBMotionStudio()
            .then(function() {
              bmsModalService.endLoading();
              $location.path('/welcome');
            }, function(error) {
              bmsModalService.openErrorDialog(error)
                .then(function() {
                  electronWindow.fromId(1).close();
                }, function() {
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
        function(electron) {
          electron.send({
            type: "buildWelcomeMenu"
          });
        }
      ])
      .controller('bmsDropZoneCtrl', ['initVisualizationService', 'initFormalModelOnlyService', 'electronDialog',
        function(initVisualizationService, initFormalModelOnlyService, electronDialog) {
          var self = this;
          self.openFileDialog = function() {
            electronDialog.showOpenDialog({
                title: 'Open BMotionWeb Visualisation',
                filters: [{
                  name: 'BMotionWeb Manifest (bmotion.json)',
                  extensions: ['json']
                }, {
                  name: 'Formal Model (*.mch, *.csp, *.bcm, *.bcc)',
                  extensions: ['mch', 'csp', 'bcm', 'bcc']
                }],
                properties: ['openFile']
              },
              function(files) {
                if (files) {
                  var file = files[0];
                  var filename = file.replace(/^.*[\\\/]/, '');
                  var fileExtension = filename.split('.').pop();
                  if (fileExtension === 'json') {
                    initVisualizationService(file);
                  } else {
                    initFormalModelOnlyService(file);
                  }
                }
              });
          };
        }
      ])
      .controller('bmsTabsCtrl', ['$scope', '$rootScope', 'bmsTabsService', 'bmsVisualizationService', 'bmsModalService', function($scope, $rootScope, bmsTabsService, bmsVisualizationService, bmsModalService) {

        var self = this;

        var disabledTabs = bmsVisualizationService.getDisabledTabs();

        self.lastTab = 'simulator';

        self.tabs = bmsTabsService.getTabs();

        self.isDisabled = function(svg) {
          return disabledTabs[svg] === undefined ? false : disabledTabs[svg]['status'];
        };

        self.whyDisabled = function(svg) {
          if (disabledTabs[svg] !== undefined && disabledTabs[svg]['status']) {
            bmsModalService.openErrorDialog(disabledTabs[svg]['reason']);
          }
        };

        self.visualizationLoaded = function() {
          return bmsVisualizationService.getCurrentVisualizationId() !== undefined;
        };

        self.hasSvg = function() {
          return self.getSvg() !== undefined;
        };

        self.getSvg = function() {
          var vis = bmsVisualizationService.getCurrentVisualization();
          if (vis) return vis.svg;
        };

        self.getCurrentVisualizationId = function() {
          return bmsVisualizationService.getCurrentVisualizationId();
        };

        self.selectEditorTab = function(svg) {
          self.currentSvg = svg;
          self.lastTab = 'editor';
          $rootScope.$broadcast('selectEditorTab');
          $rootScope.$broadcast('hideDialog');
        };

        self.selectDiagramTab = function() {
          self.lastTab = 'diagram';
          $rootScope.$broadcast('hideDialog');
        };

        self.selectSimulatorTab = function() {
          self.lastTab = 'simulator';
          $rootScope.$broadcast('showDialog');
        };

        self.removeTab = function(index) {
          bmsTabsService.removeTab(index);
        };

        self.enter = function(tab) {
          return tab.showClose = true;
        };

        self.leave = function(tab) {
          return tab.showClose = false;
        };

      }])
      .directive('bmsDropZone', ['initVisualizationService', function(initVisualizationService) {
        return {
          link: function($scope, element, attrs) {

            // prevent default behavior from changing page on dropped file
            window.ondragover = function(e) {
              e.preventDefault();
              return false
            };
            window.ondrop = function(e) {
              e.preventDefault();
              return false
            };

            var holder = element[0];
            holder.ondragover = function() {
              $(this).addClass('dragover');
              return false;
            };
            holder.ondragleave = function() {
              $(this).removeClass('dragover');
              return false;
            };
            holder.ondrop = function(e) {
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
