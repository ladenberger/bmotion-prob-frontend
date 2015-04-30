/**
 * BMotion Studio for ProB UI Module
 *
 */
define(['bmotion.func', 'bootstrap', 'jquery.cookie', 'jquery-ui', 'ui-bootstrap', 'ui-bootstrap-tpls'], function (prob) {

    var module = angular.module('prob.ui', ['ui.bootstrap'])
        .run(["$rootScope", 'editableOptions', 'initProB', function ($rootScope, editableOptions, initProB) {
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
            initProB.then(function (data) {
                if (data) {
                    $rootScope.port = data.port;
                }
            })
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
        .factory('initProB', ['$q', 'ws', function ($q, ws) {
            var defer = $q.defer();
            ws.emit('initProB', "", function (data) {
                defer.resolve(data);
            });
            return defer.promise;
        }])
        .controller('bmsTabsCtrl', ['$rootScope', '$scope', 'fileDialogService', 'bmsVisualisationService', '$http', 'bmsUIService', function ($rootScope, $scope, fileDialogService, bmsVisualisationService, $http, bmsUIService) {

            var setAllInactive = function () {
                angular.forEach($scope.workspaces, function (workspace) {
                    workspace.active = false;
                });
            };

            $scope.workspaces = [];

            $scope.addWorkspace = function () {
                setAllInactive();
            };

            $scope.openFileDialog = function () {
                fileDialogService.open().then(function (template) {
                    $http.get(template).success(function (data) {
                        $scope.workspaces.push({
                            id: prob.uuid(),
                            name: data.name,
                            template: template,
                            active: true
                        });
                    });
                });
            };

            $scope.selectWorkspace = function (id) {
                var vis = bmsVisualisationService.getVisualisation(id);
                $rootScope.currentVisualisation = id;
                if (vis) {
                    bmsUIService.setProBViewTraceId(vis.traceId);
                }
            };

        }])
        .controller('bmsTabsChildCtrl', ['$scope', function ($scope) {
        }])
        .controller('bmsLoadingModalCtrl', ['$scope', '$modal', function ($scope, $modal) {

            var modalInstance = null;

            $scope.open = function () {
                modalInstance = $modal.open({
                    templateUrl: 'bmsLoadingModal.html',
                    controller: 'bmsLoadingModalInstanceCtrl'
                });
            };

            $scope.close = function () {
                if (modalInstance) {
                    modalInstance.close();
                }
            };

            $scope.$on('startLoading', function () {
                $scope.open();
            });

            $scope.$on('endLoading', function () {
                $scope.close();
            });

        }])
        .controller('bmsLoadingModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

            $scope.close = function () {
                $modalInstance.close();
            };

        }])
        .directive('bmsNavigation', ['ws', 'bmsUIService', '$rootScope', 'bmsVisualisationService', function (ws, bmsUIService, $rootScope, bmsVisualisationService) {
            return {
                controller: ['$scope', function ($scope) {
                    $scope.openView = function (type) {
                        $scope.$broadcast('open' + type);
                    };
                    $scope.reloadVisualisation = function () {
                        document.getElementById($rootScope.currentVisualisation).contentDocument.location.reload(true);
                        bmsUIService.reloadVisualisation($rootScope.currentVisualisation);
                    };
                    /*$scope.reloadModel = function () {
                     bmsUIService.startLoading();
                     if ($rootScope.currentVisualisation) {
                     var vis = bmsVisualisationService.getVisualisation($rootScope.currentVisualisation);
                     ws.emit('reloadModel', {data: {traceId: vis.data.traceId}}, function (newTraceId) {
                     $rootScope.$broadcast('newTraceId', newTraceId);
                     vis.data.traceId = newTraceId;
                     bmsUIService.setProBViewTraceId(newTraceId);
                     bmsUIService.endLoading();
                     });
                     }
                     };*/
                }],
                link: function ($scope, element) {
                    /*if (config.socket.host !== 'localhost') {
                     $(element).find('#bt_GroovyConsoleSession').css("display", "none");
                     $(element).find('#bt_ModelCheckingUI').css("display", "none");
                     $(element).find('#bt_CurrentAnimations').css("display", "none");
                     }*/
                }
            }
        }])
        .factory('bmsDialogService', [function () {
            return {
                isOpen: function (type) {
                    return $.cookie("open_" + type) === undefined ? false : $.cookie("open_" + type);
                },
                open: function (element, type) {
                    $.cookie("open_" + type, true);
                    var toppos = $.cookie("position_top_" + type);
                    var leftpos = $.cookie("position_left_" + type);
                    var width = $.cookie("width_" + type);
                    var height = $.cookie("height_" + type);
                    if (toppos !== undefined && leftpos !== undefined) {
                        element.parent().css("top", toppos + "px").css("left", leftpos + "px")
                    }
                    if (width !== undefined && height !== undefined) {
                        element.parent().css("width", width + "px").css("height", height + "px")
                    }
                },
                close: function (type) {
                    $.removeCookie("open_" + type);
                    $.removeCookie("position_top" + type);
                    $.removeCookie("position_left_" + type);
                    $.removeCookie("width_" + type);
                    $.removeCookie("height_" + type);
                },
                dragStop: function (ui, type) {
                    $.cookie("position_top_" + type, ui.position.top);
                    $.cookie("position_left_" + type, ui.position.left)
                },
                resizeStop: function (ui, type) {
                    $.cookie("width_" + type, ui.size.width);
                    $.cookie("height_" + type, ui.size.height);
                },
                fixSize: function (dialog, ox, oy) {
                    var newwidth = dialog.parent().width() - ox;
                    var newheight = dialog.parent().height() - oy;
                    dialog.first().css("width", (newwidth) + "px").css("height", (newheight - 38) + "px");
                }
            }
        }])
        .directive('probView', function () {
            return {
                replace: true,
                scope: true,
                template: '<div style="width:100%;height:100%"><iframe src="" frameBorder="0" style="width:100%;height:100%"></iframe></div>',
                link: function ($scope, element) {

                    $scope.traceId = null;
                    var iframe = $(element).find("iframe");

                    $scope.open = function (traceId) {
                        if (traceId && $scope.traceId != traceId) {
                            iframe.attr("src", 'http://localhost:' + $scope.port + '/sessions/' + $scope.type + '/' + traceId);
                            $scope.traceId = traceId;
                        }
                    };

                    $scope.$on('dragStart', function () {
                        iframe.hide();
                    });
                    $scope.$on('dragStop', function () {
                        iframe.show();
                    });
                    $scope.$on('resize', function () {
                        iframe.hide();
                    });
                    $scope.$on('resizeStart', function () {
                        iframe.hide();
                    });
                    $scope.$on('resizeStop', function () {
                        iframe.show();
                    });
                    $scope.$on('open', function (traceId) {
                        $scope.open(traceId);
                    });
                    $scope.$on('setProBViewTraceId', function (evt, traceId) {
                        if ($scope.isOpen) {
                            $scope.open(traceId);
                        }
                    });
                }
            }
        })
        .directive('bmsDialog', ['bmsDialogService', function (bmsDialogService) {
            return {
                scope: true,
                controller: ['$scope', function ($scope) {
                    $scope.isOpen = false;
                }],
                link: function ($scope, element, attrs) {

                    $scope.type = attrs.type;
                    $scope.isOpen = bmsDialogService.isOpen($scope.type);
                    $scope.$on('open' + $scope.type, function () {
                        $(element).dialog("open");
                    });

                    $(element).first().css("overflow", "hidden");
                    $(element).dialog({

                        dragStart: function () {
                            $scope.$broadcast('dragStart');
                        },
                        dragStop: function (event, ui) {
                            bmsDialogService.dragStop(ui, $scope.type);
                            $scope.$broadcast('dragStop');
                        },
                        resize: function () {
                            $scope.$broadcast('resize');
                        },
                        resizeStart: function () {
                            $scope.$broadcast('resizeStart');
                        },
                        resizeStop: function (event, ui) {
                            bmsDialogService.resizeStop(ui, $scope.type);
                            bmsDialogService.fixSize($(element), 0, 0);
                            $scope.$broadcast('resizeStop');
                        },
                        open: function () {
                            bmsDialogService.open(element, $scope.type);
                            bmsDialogService.fixSize($(element), 0, 0);
                            $scope.isOpen = true;
                            $scope.$broadcast('open');
                        },
                        close: function () {
                            bmsDialogService.close($scope.type);
                            $scope.isOpen = false;
                            $scope.$broadcast('close');
                        },
                        autoOpen: $scope.isOpen,
                        width: 500,
                        height: 400,
                        title: $scope.type

                    });

                }
            }
        }]);

    return module;

});