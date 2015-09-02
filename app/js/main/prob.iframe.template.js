/**
 * BMotion Studio for ProB IFrame Module
 *
 */
define(['bms.func', 'prob.common', 'prob.observers', 'prob.modal'], function (bms) {

    var module = angular.module('prob.iframe.template', ['prob.common', 'prob.observers', 'prob.modal'])
        .directive('bmsVisualisationView', ['$rootScope', 'bmsVisualizationService', 'bmsObserverService', 'ws', '$injector', 'bmsUIService', 'bmsModalService', 'trigger', function ($rootScope, bmsVisualizationService, bmsObserverService, ws, $injector, bmsUIService, bmsModalService, trigger) {
            return {
                replace: false,
                scope: {
                    view: '@bmsVisualisationView',
                    sessionId: '@bmsVisualisationSession'
                },
                template: '<iframe src="" frameBorder="0" class="fullWidthHeight bmsIframe"></iframe>',
                controller: ['$scope', function ($scope) {

                    var self = this;

                    self.data = {};

                    self.checkObserver = function (observer, stateId, cause) {
                        stateId = stateId ? stateId : self.data.stateId;
                        cause = cause ? cause : trigger.TRIGGER_ANIMATION_CHANGED;
                        if (observer && stateId && trigger) {
                            bmsObserverService.checkObserver($scope.sessionId, $scope.id, observer, self.data.container.contents(), stateId, cause)
                                .then(function (data) {
                                    if (!bms.isEmpty(data)) {
                                        $scope.$broadcast('setValue', data);
                                    }
                                });
                        }
                    };

                    self.checkObservers = function (stateId, cause) {

                        var observers = bmsObserverService.getObservers($scope.id);
                        stateId = stateId ? stateId : self.data.stateId;
                        cause = cause ? cause : trigger.TRIGGER_ANIMATION_CHANGED;

                        if (observers && stateId && cause) {

                            // Collect values from observers
                            bmsObserverService.checkObservers($scope.sessionId, $scope.id, observers, self.data.container.contents(), stateId, cause).then(function (data) {
                                var fvalues = {};
                                angular.forEach(data, function (value) {
                                    if (value !== undefined) {
                                        $.extend(true, fvalues, value);
                                    }
                                });
                                if (!bms.isEmpty(fvalues)) {
                                    $scope.$broadcast('changeValues', fvalues);
                                }
                            });

                        }

                    };

                    self.setupEvents = function () {
                        var events = bmsObserverService.getEvents($scope.id);
                        events.forEach(function (evt) {
                            var instance = $injector.get(evt.type, "");
                            if (instance) {
                                instance.setup($scope.sessionId, $scope.id, evt, self.data.container.contents(), self.data.traceId);
                            }
                        });
                    };

                    $scope.addSvg = function (svg) {
                        bmsVisualizationService.addSvg($scope.id, svg);
                    };

                    $scope.addObserver = function (type, data) {

                        var shouldAdd = true;
                        if (data.refinement) {
                            if ($.inArray(data.refinement, self.data.refinements) == -1) {
                                shouldAdd = false;
                            }
                        }
                        if (shouldAdd) {

                            var observer = {
                                type: type,
                                data: data
                            };

                            bmsObserverService.addObserver($scope.id, observer);

                            if (self.data.stateId !== 'root' && self.data.initialised) {
                                self.checkObserver(observer, self.data.stateId, data.cause);
                            }

                        }
                    };

                    $scope.addEvent = function (type, data) {
                        var shouldAdd = true;
                        if (data.refinement) {
                            if ($.inArray(data.refinement, self.data.refinements) == -1) {
                                shouldAdd = false;
                            }
                        }
                        if (shouldAdd) {
                            var event = {
                                type: type,
                                data: data
                            };
                            bmsObserverService.addEvent($scope.id, event);
                            var instance = $injector.get(type, "");
                            if (instance) {
                                instance.setup($scope.sessionId, $scope.id, event, self.data.container.contents(), self.data.traceId);
                            }
                        }
                    };

                    ws.on('checkObserver', function (cause, s) {
                        var stateId = s.stateId;
                        var traceId = s.traceId;
                        self.data.stateId = stateId;
                        self.data.traceID = traceId;
                        if (cause === trigger.TRIGGER_MODEL_INITIALISED) {
                            self.data.initialised = true;
                        }
                        if (self.data.traceId == traceId) {
                            self.checkObservers(stateId, cause);
                        }
                    });

                    $scope.$on('reloadTemplate', function () {
                        self.checkObservers();
                        self.setupEvents();
                    });

                }],
                link: function ($scope, $element, attrs, ctrl) {

                    var iframe = $($element.contents());
                    $scope.id = bms.uuid();

                    var initView = function (sessionId, view) {

                        bmsModalService.startLoading("Initialising View ...");

                        $scope.sessionId = sessionId;

                        ws.emit('initView', {data: {id: sessionId}}, function (r) {

                            ctrl.data = $.extend(r, {
                                container: iframe
                            });

                            var template;
                            var viewObj;
                            if (view) {
                                angular.forEach(ctrl.data.views, function (v) {
                                    if (v.id === view) {
                                        viewObj = v;
                                        template = v.template;
                                    }
                                });
                            } else {
                                template = ctrl.data.template;
                            }

                            if (template) {
                                iframe.attr('src', ctrl.data.templateFolder + '/' + template).attr('id', $scope.id);
                                iframe.load(function () {
                                    bmsVisualizationService.setCurrentVisualizationId($scope.id);
                                    bmsVisualizationService.addVisualization($scope.id, ctrl.data);
                                    bmsUIService.setProBViewTraceId(ctrl.data.traceId);
                                    bmsModalService.endLoading();
                                    $rootScope.$broadcast('visualizationLoaded', $scope.id, viewObj);
                                });
                            }

                        });

                    };

                    $scope.$watch(function () {
                        return [attrs.bmsVisualisationSession, attrs.bmsVisualisationView];
                    }, function (d) {
                        if (d[0]) {
                            initView(d[0], d[1]);
                        }
                    }, true);

                }
            }
        }]);

    return module;

});
