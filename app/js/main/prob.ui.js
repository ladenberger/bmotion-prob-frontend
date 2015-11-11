/**
 * BMotion Studio for ProB UI Module
 *
 */
define(['jquery', 'angular', 'jquery-ui', 'ui-bootstrap', 'bms.config'], function ($) {

    var module = angular.module('prob.ui', ['ui.bootstrap', 'bms.config'])
        .controller('bmsUiNavigationCtrl', ['$scope', '$rootScope', 'bmsVisualizationService',
            function ($scope, $rootScope, bmsVisualizationService) {

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
                    //console.log(vis)
                    return vis && vis['manifest'] && vis['manifest']['tool'] === 'BAnimation';
                };

                self.reloadVisualization = function () {
                    var id = bmsVisualizationService.getCurrentVisualizationId();
                    if (id) {
                        document.getElementById(id).contentDocument.location.reload(true);
                        $rootScope.$broadcast('reloadVisualisation', id);
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
        .directive('bmsDialog', ['bmsVisualizationService', '$timeout', function (bmsVisualizationService, $timeout) {
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

                    $scope.$on('visualizationLoaded', function (evt, visualization) {
                        var autoOpen;
                        if (visualization['view']) {
                            autoOpen = visualization['view']['autoOpen'];
                        } else {
                            var vis = bmsVisualizationService.getVisualization(visualization['id']);
                            autoOpen = vis.autoOpen;
                        }
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

                    $scope.$on('$destroy', function () {
                        if (d.hasClass('ui-dialog-content')) {
                            d.dialog("destroy");
                        }
                    });

                    $scope.$watch(function () {
                        return ctrl.state;
                    }, function (newVal) {
                        d.dialog(newVal);
                    });

                    d.first().css("overflow", "hidden");
                    d.dialog({
                        resizeStop: function () {
                            ctrl.fixSize(d, 0, 0);
                            ctrl.propagateEvent('resizeStop');
                        },
                        open: function () {
                            ctrl.fixSize(d, 0, 0);
                            ctrl.propagateEvent('open');
                        },
                        close: function () {
                            $timeout(function () {
                                $scope.$apply(function () {
                                    ctrl.state = 'close';
                                });
                            });
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

                    $scope.$on('openDialog_GroovyConsoleSession', function () {
                        $scope.setUrl();
                    });

                    $scope.$on('setProBViewTraceId', function (evt, traceId) {
                        $scope.traceId = traceId;
                    });

                }],
                link: function ($scope, element, attrs, ctrl) {

                    var iframe = $(element).find("iframe");

                    ctrl.onEventListener('open', function () {
                        if ($scope.postpone) {
                            $scope.setUrl($scope.traceId);
                            $scope.postpone = false;
                        }
                    });

                    $scope.setUrl = function (postfix) {
                        $q.all([bmsConfigService.getConfig(), probMainService.getPort()]).then(function (data) {
                            postfix = postfix ? postfix : '';
                            iframe.attr("src", 'http://' + data[0].prob.host + ':' + data[1].port + '/sessions/' + ctrl.getType() + '/' + postfix);
                        });
                    };

                    $scope.$watch('traceId', function (newTraceId, oldTraceId) {
                        if (newTraceId && newTraceId !== oldTraceId) {
                            if (ctrl.isOpen()) {
                                if (newTraceId) {
                                    $scope.setUrl(newTraceId);
                                }
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