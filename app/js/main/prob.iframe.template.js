/**
 * BMotion Studio for ProB IFrame Module
 *
 */
define(['bms.func', 'jquery', 'prob.common', 'prob.observers', 'prob.modal'], function (bms, $) {

    var module = angular.module('prob.iframe.template', ['prob.common', 'prob.observers', 'prob.modal'])
        .directive('bmsVisualisationView', ['$rootScope', 'bmsVisualizationService', 'bmsObserverService', 'ws', '$injector', 'bmsUIService', 'bmsModalService', 'trigger', '$compile', function ($rootScope, bmsVisualizationService, bmsObserverService, ws, $injector, bmsUIService, bmsModalService, trigger, $compile) {
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

                    self.attrs = {};

                    $scope.values = {};

                    self.checkObserver = function (observer, stateId, cause) {
                        stateId = stateId ? stateId : self.data.stateId;
                        cause = cause ? cause : trigger.TRIGGER_ANIMATION_CHANGED;
                        if (observer && stateId && trigger) {
                            bmsObserverService.checkObserver($scope.sessionId, $scope.id, observer, self.data.container.contents(), stateId, cause)
                                .then(function (data) {
                                    if (!bms.isEmpty(data)) {
                                        $scope.values = $.extend(true, $scope.values, data);
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
                                    $scope.values = fvalues;
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

                    $scope.getValue = function (bmsid, attr, defaultValue) {
                        var returnValue = defaultValue === 'undefined' ? undefined : defaultValue;
                        var ele = $scope.values[bmsid];
                        if (ele) {
                            returnValue = ele[attr] === undefined ? returnValue : ele[attr];
                        }
                        return returnValue;
                    };

                }],
                link: function ($scope, $element, attrs, ctrl) {

                    var iframe = $($element.contents());
                    var iframeContents;
                    $scope.id = bms.uuid();

                    var initView = function (sessionId, view) {

                        bmsModalService.loading("Initialising View ...");

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
                                    iframeContents = $(iframe.contents());
                                    bmsVisualizationService.setCurrentVisualizationId($scope.id);
                                    bmsVisualizationService.addVisualization($scope.id, ctrl.data);
                                    bmsUIService.setProBViewTraceId(ctrl.data.traceId);
                                    $compile(iframeContents)($scope);
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

                    $scope.$watch("values", function (values) {
                        for (bmsid in values) {
                            var nattrs = values[bmsid];
                            for (var a in nattrs) {
                                if (ctrl.attrs[bmsid] === undefined) {
                                    ctrl.attrs[bmsid] = [];
                                }
                                if ($.inArray(a, ctrl.attrs[bmsid])) {
                                    var orgElement = iframeContents.find('[data-bms-id=' + bmsid + ']');
                                    var attrDefault = orgElement.attr(a);
                                    // Special case for class attributes
                                    if (a === "class" && attrDefault === undefined) {
                                        attrDefault = ""
                                    }
                                    orgElement.attr("ng-attr-" + a,
                                        "{{getValue('" + bmsid + "','" + a + "','" + attrDefault + "')}}");
                                    ctrl.attrs[bmsid].push(a);
                                    $compile(orgElement)($scope);
                                }
                            }
                        }
                    }, true);

                }
            }
        }])
        .directive('bmsSvg', ['$http', 'bmsVisualizationService', function ($http, bmsVisualizationService) {
            return {
                replace: false,
                /*transclude: true,
                 scope: {
                 svg: '@bmsSvg',
                 id: '@id'
                 },*/
                controller: ['$scope', function ($scope) {
                }],
                link: function ($scope, element, attrs) {

                    var svg = attrs['bmsSvg'];
                    var vis = bmsVisualizationService.getVisualization($scope.id);
                    bmsVisualizationService.addSvg($scope.id, svg);

                    var reloadTemplate = function () {
                        return $http.get(vis.templateFolder + '/' + svg).success(function (svgCode) {
                            element.html(svgCode);
                        });
                    };
                    reloadTemplate();

                    /*$parentScope.$on('visualizationSaved', function () {
                     reloadTemplate().then(function () {
                     $compile(element.contents())($scope);
                     $parentScope.$broadcast('reloadTemplate');
                     });
                     });*/

                }
            }
        }]);

    return module;

});
