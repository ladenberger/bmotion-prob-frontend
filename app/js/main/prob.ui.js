/**
 * BMotion Studio for ProB UI Module
 *
 */
define(['angular', 'jquery-ui', 'ui-bootstrap', 'bms.config'], function () {

    var module = angular.module('prob.ui', ['ui.bootstrap', 'bms.config'])
        .controller('bmsUiNavigationCtrl', ['$scope', '$rootScope', 'bmsUIService', 'bmsVisualizationService', function ($scope, $rootScope, bmsUIService, bmsVisualizationService) {

            var self = this;

            // Navigation button actions ...
            self.openDialog = function (type) {
                $rootScope.$broadcast('openDialog_' + type);
            };

            self.visualizationLoaded = function () {
                return bmsVisualizationService.getCurrentVisualizationId() !== undefined;
            };

            self.isBAnimation = function () {
                var vis = bmsVisualizationService.getCurrentVisualization();
                return vis && vis.tool === 'BAnimation';
            };

            self.reloadVisualization = function () {
                var id = bmsVisualizationService.getCurrentVisualizationId();
                if (id) {
                    document.getElementById(id).contentDocument.location.reload(true);
                    bmsUIService.reloadVisualisation(id);
                }
            };

            self.editVisualization = function (svgid) {
                $rootScope.$broadcast('openEditorModal', bmsVisualizationService.getCurrentVisualizationId(), svgid);
            };

            self.openElementProjectionDiagram = function () {
                $rootScope.$broadcast('openElementProjectionModal');
            };

            self.openTraceDiagram = function () {
                $rootScope.$broadcast('openTraceDiagramModal');
            };

            self.hasSvg = function () {
                return self.getSvg() !== undefined;
            };

            self.getSvg = function () {
                var vis = bmsVisualizationService.getCurrentVisualization();
                if (vis) return vis.svg;
            }

        }])
        .directive('bmsDialog', [function () {
            return {
                scope: {
                    type: '@',
                    title: '@'
                },
                controller: ['$scope', function ($scope) {

                    var self = this;

                    self.listeners = {
                        dragStart: [],
                        dragStop: [],
                        resize: [],
                        resizeStart: [],
                        resizeStop: [],
                        open: [],
                        close: []
                    };

                    self.state = 'close';
                    self.hidden = false;

                    self.getType = function () {
                        return $scope.type;
                    };

                    self.getTitle = function () {
                        return $scope.title;
                    };

                    self.onEventListener = function (type, handler) {
                        self.listeners[type].push(handler);
                    };

                    self.propagateEvent = function (type) {
                        self.listeners[type].forEach(function (handler) {
                            handler();
                        });
                    };

                    self.isOpen = function () {
                        return self.state === 'open' ? true : false;
                    };

                    self.open = function () {
                        self.state = 'open';
                    };

                    self.fixSize = function (dialog, ox, oy) {
                        var newwidth = dialog.parent().width() - ox;
                        var newheight = dialog.parent().height() - oy;
                        dialog.first().css("width", (newwidth) + "px").css("height", (newheight - 38) + "px");
                    };

                    $scope.$on('visualizationLoaded', function (evt, vis) {
                        var autoOpen = vis['autoOpen'];
                        if (autoOpen && $.inArray($scope.type, autoOpen) > -1) {
                            self.open();
                        }
                    });

                    $scope.$on('openDialog_' + $scope.type, function () {
                        self.state = 'open';
                    });

                    $scope.$on('closeDialog', function () {
                        self.state = 'close';
                    });

                    $scope.$on('hideDialog', function () {
                        if (self.state === 'open') {
                            self.hidden = true;
                            self.state = 'close';
                        }
                    });

                    $scope.$on('showDialog', function () {
                        if (self.state === 'close' && self.hidden) {
                            self.hidden = false;
                            self.state = 'open';
                        }
                    });

                }],
                link: function ($scope, element, attrs, ctrl) {

                    var d = $(element);

                    $scope.$watch(function () {
                        return ctrl.state;
                    }, function (newVal) {
                        d.dialog(newVal);
                    });

                    $(element).first().css("overflow", "hidden");
                    $(element).dialog({
                        resizeStop: function () {
                            ctrl.fixSize($(element), 0, 0);
                            ctrl.propagateEvent('resizeStop');
                        },
                        open: function () {
                            ctrl.fixSize($(element), 0, 0);
                            ctrl.propagateEvent('open');
                        },
                        close: function () {
                            ctrl.state = 'close';
                            ctrl.propagateEvent('close');
                        },
                        autoOpen: ctrl.isOpen(),
                        width: 400,
                        height: 450,
                        title: $scope.title
                    });

                }
            }
        }])
        .directive('probView', ['bmsConfigService', 'probMainService', '$q', function (bmsConfigService, probMainService, $q) {
            return {
                replace: true,
                scope: {},
                template: '<div style="width:100%;height:100%"><iframe src="" frameBorder="0" style="width:100%;height:100%"></iframe></div>',
                require: '^bmsDialog',
                controller: ['$scope', function ($scope) {

                    $scope.postpone = false;

                    $scope.$on('setProBViewTraceId', function (evt, traceId) {
                        $scope.traceId = traceId;
                    });

                }],
                link: function ($scope, element, attrs, ctrl) {

                    var iframe = $(element).find("iframe");

                    ctrl.onEventListener('open', function () {
                        if ($scope.postpone) {
                            $scope.setTraceId($scope.traceId);
                            $scope.postpone = false;
                        }
                    });

                    $scope.setTraceId = function (traceId) {
                        if (traceId !== undefined) {
                            $q.all([bmsConfigService.getConfig(), probMainService.getPort()]).then(function (data) {
                                iframe.attr("src", 'http://' + data[0].prob.host + ':' + data[1].port + '/sessions/' + ctrl.getType() + '/' + traceId);
                            });
                        }
                    };

                    $scope.$watch('traceId', function (newTraceId, oldTraceId) {
                        if (newTraceId && newTraceId !== oldTraceId) {
                            if (ctrl.isOpen()) {
                                $scope.setTraceId(newTraceId);
                            } else {
                                $scope.postpone = true;
                            }
                        }
                    });

                }
            }
        }]);

    return module;

});