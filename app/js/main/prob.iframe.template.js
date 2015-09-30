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
                                        $scope.applyValues();
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
                                    $scope.applyValues();
                                }
                            });

                        }

                    };

                    self.triggerListeners = function (cause) {
                        var vis = bmsVisualizationService.getVisualization($scope.id);
                        if (vis.listener) {
                            angular.forEach(vis.listener[cause], function (l) {
                                if (!l.executed) {
                                    l.callback();
                                    // Init listener should be called only once
                                    if (cause === "ModelInitialised") l.executed = true;
                                }
                            });
                        }
                    };

                    self.setupEvents = function () {
                        var events = bmsObserverService.getEvents($scope.id);
                        angular.forEach(events, function (evt) {
                            self.setupEvent(evt);
                        });
                    };

                    self.setupEvent = function (evt) {
                        try {
                            var instance = $injector.get(evt.type, "");
                            instance.setup($scope.sessionId, $scope.id, evt, self.data.container.contents(), self.data.traceId);
                        } catch (err) {
                            bmsModalService.setError("No event with type '" + evt.type + "' exists! (Selector: " + evt.data.selector + ")");
                        }
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

                    $scope.eval = function (options) {

                        var options = bms.normalize($.extend({
                            formulas: [],
                            translate: false,
                            trigger: function () {
                            }
                        }, options), ["trigger"]);

                        ws.emit('evaluateFormulas', {
                                data: {
                                    id: $scope.sessionId,
                                    formulas: options.formulas.map(function (f) {
                                        return {
                                            formula: f,
                                            translate: options.translate
                                        }
                                    })
                                }
                            }, function (r) {
                                options.trigger(bms.mapFilter(options.formulas, function (f) {
                                    return r[f].trans !== undefined ? r[f].trans : r[f].result;
                                }));
                            }
                        );

                    };

                    $scope.on = function (what, callback) {
                        var listener = bmsVisualizationService.addListener($scope.id, what, callback);
                        if (what === "ModelInitialised" && self.data.initialised) {
                            // Init listener should be called only once
                            listener.callback();
                            listener.executed = true;
                        }
                    };

                    ws.on('checkObserver', function (cause, s) {
                        self.data.stateId = s.stateId;
                        self.data.traceId = s.traceId;
                        if (cause === trigger.TRIGGER_MODEL_INITIALISED) {
                            self.data.initialised = true;
                        }
                        if (cause === trigger.TRIGGER_MODEL_SETUP_CONSTANTS) {
                            self.data.setupConstants = true;
                        }
                        if (self.data.traceId == s.traceId) {
                            self.checkObservers(s.stateId, cause);
                            self.triggerListeners(cause);
                        }
                    });

                    $scope.$on('reloadTemplate', function () {
                        bmsObserverService.clearBmsIdCache($scope.id);
                        self.attrs = {};
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

                }
                ],
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

                    $scope.applyValues = function () {
                        var values = $scope.values;
                        for (bmsid in values) {
                            var nattrs = values[bmsid];
                            for (var a in nattrs) {
                                if (ctrl.attrs[bmsid] === undefined) {
                                    ctrl.attrs[bmsid] = [];
                                }
                                if (ctrl.attrs[bmsid].indexOf(a) === -1) {
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
                    };

                }
            }
        }
        ])
        .
        directive('bmsSvg', ['$http', 'bmsVisualizationService', '$rootScope', function ($http, bmsVisualizationService, $rootScope) {
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

                    $scope.$on('visualizationSaved', function () {
                        reloadTemplate().then(function () {
                            $rootScope.$broadcast('reloadTemplate');
                        });
                    });

                }
            }
        }]);

    return module;

})
;
