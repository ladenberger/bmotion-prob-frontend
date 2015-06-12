/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'bms.func', 'angular', 'prob.graph', 'prob.iframe', 'prob.editor', 'prob.ui', 'prob.common', 'prob.modal'], function (angularAMD, bms) {

    var module = angular.module('prob.standalone', ['prob.graph', 'prob.iframe', 'prob.editor', 'prob.ui', 'prob.common', 'prob.modal'])
        .run(['editableOptions', 'bmsMainService', 'GUI', 'Window', 'fileDialogService', '$rootScope', function (editableOptions, bmsMainService, GUI, Window, fileDialogService, $rootScope) {

            bmsMainService.mode = 'ModeStandalone';
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'

            var openDialog = function (type) {
                $rootScope.$broadcast('openDialog_' + type);
            };

            // Create node-webkit menu
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
                label: 'Open Visualization',
                click: function () {
                    fileDialogService.open().then(function (template) {
                        $rootScope.$broadcast('setVisualization', template);
                    });
                }
            }));

            // ProB menu
            var probView = new GUI.Menu();
            windowMenu.append(new GUI.MenuItem({
                label: 'ProB',
                submenu: probView
            }));
            probView.append(new GUI.MenuItem({
                label: 'Events',
                click: function () {
                    openDialog('Events');
                }
            }));
            probView.append(new GUI.MenuItem({
                label: 'History',
                click: function () {
                    openDialog('CurrentTrace');
                }
            }));
            probView.append(new GUI.MenuItem({
                label: 'State',
                click: function () {
                    openDialog('StateInspector');
                }
            }));
            probView.append(new GUI.MenuItem({
                label: 'Animations',
                click: function () {
                    openDialog('CurrentAnimations');
                }
            }));
            probView.append(new GUI.MenuItem({
                label: 'Console',
                click: function () {
                    openDialog('GroovyConsoleSession');
                }
            }));
            probView.append(new GUI.MenuItem({
                label: 'Model Checking',
                click: function () {
                    openDialog('ModelCheckingUI');
                }
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
                    $rootScope.$broadcast('openElementProjectionModal');
                }
            }));
            diagramMenu.append(new GUI.MenuItem({
                label: 'Trace Diagram',
                click: function () {
                    $rootScope.$broadcast('openTraceDiagramModal');
                }
            }));

            Window.menu = windowMenu;

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
        }])
        .controller('bmsVisualizationCtrl', ['$scope', 'fileDialogService', 'bmsModalService', '$http', 'GUI', function ($scope, fileDialogService, bmsModalService, $http, GUI) {

            var self = this;

            self.setVisualization = function (template) {

                var filename = template.replace(/^.*[\\\/]/, '');
                if (filename === 'bmotion.json') {
                    $http.get(template).success(function () {
                        sessionStorage.template = template;
                        self.template = template;
                        self.id = bms.uuid();
                    });
                } else {
                    bmsModalService.setError('Invalid file, please open a bmotion.json file!');
                }

            };

            self.openFileDialog = function () {
                fileDialogService.open().then(function (template) {
                    self.setVisualization(template);
                });
            };

            $scope.$on('setVisualization', function (evt, template) {
                self.setVisualization(template);
            });

            var templateFromNw = GUI.App.argv[0];
            if (sessionStorage.template) {
                self.setVisualization(sessionStorage.template);
            } else if (templateFromNw) {
                self.setVisualization(templateFromNw);
            }

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
                            var template = e.dataTransfer.files[0].path;
                            //TODO: Check if correct file ...
                            var filename = template.replace(/^.*[\\\/]/, '');
                            if (filename === 'bmotion.json') {
                                $http.get(template).success(function () {
                                    $scope.$emit('setVisualization', template);
                                });
                            } else {
                                bmsModalService.setError('Invalid file, please drop a bmotion.json file!');
                            }
                        }
                        return false;
                    };

                }
            }
        }])
        .directive('bmsApp', ['$compile', function ($compile) {
            return {
                replace: false,
                link: function ($scope, $element, attrs) {
                    angular.element(document.getElementsByTagName('body'))
                        .append($compile('<div bms-ui class="fullWidthHeight"></div>')($scope));
                }
            }
        }]);
    return angularAMD.bootstrap(module);

});