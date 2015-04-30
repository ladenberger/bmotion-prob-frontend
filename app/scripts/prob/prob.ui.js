/**
 * BMotion Studio for ProB UI Module
 *
 */
define(['bmotion.func', 'angular'], function (prob) {

    var module = angular.module('prob.ui', [])
        .directive('bmsNavigation', ['ws', 'bmsUIService', '$rootScope', 'bmsVisualisationService', function (ws, bmsUIService, $rootScope) {
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
        .directive('probView', ['bmsConfigService', 'probMainService', '$q', function (bmsConfigService, probMainService, $q) {
            return {
                replace: true,
                scope: true,
                template: '<div style="width:100%;height:100%"><iframe src="" frameBorder="0" style="width:100%;height:100%"></iframe></div>',
                controller: ['$scope', function ($scope) {

                    $scope.postpone = false;

                    $scope.$on('setProBViewTraceId', function (evt, traceId) {
                        $scope.traceId = traceId;
                    });

                }],
                link: function ($scope, element) {

                    var iframe = $(element).find("iframe");

                    $scope.setTraceId = function (traceId) {
                        $q.all([bmsConfigService.getConfig(), probMainService.getPort()]).then(function (data) {
                            iframe.attr("src", 'http://' + data[0].prob.host + ':' + data[1].port + '/sessions/' + $scope.type + '/' + traceId);
                        });
                    };

                    $scope.$watch('traceId', function (newTraceId, oldTraceId) {
                        if (newTraceId && newTraceId !== oldTraceId) {
                            if ($scope.isOpen) {
                                $scope.setTraceId(newTraceId);
                            } else {
                                $scope.postpone = true;
                            }
                        }
                    });

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

                    $scope.$on('open', function () {
                        if ($scope.postpone) {
                            $scope.setTraceId($scope.traceId);
                            $scope.postpone = false;
                        }
                    });

                }
            }
        }])
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