/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'bms.func', 'angular', 'prob.graph', 'prob.iframe', 'prob.ui', 'prob.common'], function (angularAMD, bms) {

    var module = angular.module('prob.standalone', ['prob.graph', 'prob.iframe', 'prob.ui', 'prob.common'])
        .run(['ws', 'editableOptions', 'bmsMainService', function (ws, editableOptions, bmsMainService) {
            bmsMainService.mode = 'ModeStandalone';
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
            /*
             // Load native UI library
             var gui = require('nw.gui');
             // Get the current window
             var win = gui.Window.get();
             // Listen to close event
             win.on('close', function () {
             this.hide(); // Pretend to be closed already
             ws.emit('clientClosed', {data: {}});
             //this.close(true);
             });
             */
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
        .controller('bmsVisualizationCtrl', ['$scope', 'fileDialogService', 'bmsModalService', '$http', function ($scope, fileDialogService, bmsModalService, $http) {

            $scope.setVisualization = function (vis) {
                $scope.visualization = vis;
            };

            $scope.openFileDialog = function () {
                fileDialogService.open().then(function (template) {
                    var filename = template.replace(/^.*[\\\/]/, '');
                    if (filename === 'bmotion.json') {
                        $http.get(template).success(function (data) {
                            $scope.setVisualization({
                                id: bms.uuid(),
                                name: data.name,
                                template: template
                            });
                        });
                    } else {
                        bmsModalService.setError('Invalid file, please drop a bmotion.json file!');
                    }
                });
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
                            var template = e.dataTransfer.files[0].path;
                            //TODO: Check if correct file ...
                            var filename = template.replace(/^.*[\\\/]/, '');
                            if (filename === 'bmotion.json') {
                                $http.get(template).success(function (data) {
                                    $scope.setVisualization({
                                        id: bms.uuid(),
                                        name: data.name,
                                        template: template
                                    });
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