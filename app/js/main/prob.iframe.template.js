/**
 * BMotion Studio for ProB IFrame Module
 *
 */
define(['angular', 'bms.func', 'jquery', 'prob.common', 'prob.observers', 'prob.modal'], function (angular, bms, $) {

    var module = angular.module('prob.iframe.template', ['prob.common', 'prob.observers', 'prob.modal'])
        .directive('bmsVisualisationView', ['$rootScope', 'bmsVisualizationService', 'bmsObserverService', 'ws', '$injector', 'bmsUIService', 'bmsModalService', 'trigger', '$compile', '$http', '$timeout', '$q',
            function ($rootScope, bmsVisualizationService, bmsObserverService, ws, $injector, bmsUIService, bmsModalService, trigger, $compile, $http, $timeout, $q) {
                return {
                    replace: false,
                    scope: {
                        view: '@bmsVisualisationView',
                        sessionId: '@bmsVisualisationSession'
                    },
                    template: '<iframe src="" frameBorder="0" class="fullWidthHeight bmsIframe"></iframe>',
                    controller: ['$scope', function ($scope) {

                        var self = this;

                        var shouldAdd = function (type, data) {
                            var shouldAdd = true;
                            if (data.refinement) {
                                if ($.inArray(data.refinement, self.data.refinements) == -1) {
                                    shouldAdd = false;
                                }
                            }
                            return shouldAdd;
                        };

                        self.attrs = {};

                        $scope.id = bms.uuid();

                        bmsVisualizationService.setCurrentVisualizationId($scope.id);
                        self.data = bmsVisualizationService.getVisualization($scope.id);

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

                        self.checkJsonObservers = function (stateId, cause) {
                            self.checkObservers(stateId, cause, 'json');
                        };

                        self.checkJsObservers = function (stateId, cause) {
                            self.checkObservers(stateId, cause, 'js');
                        };

                        self.checkAllObservers = function (stateId, cause) {
                            self.checkObservers(stateId, cause);
                        };

                        self.checkObservers = function (stateId, cause, list) {

                            var observers = bmsVisualizationService.getObservers($scope.id, list);

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
                            if (shouldAdd(type, data)) {
                                var observer = {
                                    type: type,
                                    data: data
                                };
                                bmsVisualizationService.addObserver($scope.id, observer, 'js');
                                if (self.data.stateId !== 'root' && self.data.initialised) {
                                    self.checkObserver(observer, self.data.stateId, data.cause);
                                }
                            }
                        };

                        $scope.addEvent = function (type, data) {
                            if (shouldAdd(type, data)) {
                                var event = {
                                    type: type,
                                    data: data
                                };
                                bmsVisualizationService.addEvent($scope.id, event, 'js');
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
                                self.checkAllObservers(s.stateId, cause);
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
                        ctrl.data['container'] = iframe;

                        var loadServerData = function (sessionId) {
                            var defer = $q.defer();
                            // Get data from server
                            ws.emit('initView', {data: {id: sessionId}}, function (serverData) {
                                defer.resolve(serverData);
                            });
                            return defer.promise;
                        };

                        var loadManifestData = function (templateFolder) {

                            var defer = $q.defer();

                            $http.get(templateFolder + '/bmotion.json')
                                .success(function (manifestData) {
                                    defer.resolve(manifestData);
                                })
                                .error(function () {
                                    // TODO: Handle error ...
                                });

                            return defer.promise;

                        };

                        var loadViewData = function (view, manifestData) {
                            var defer = $q.defer();
                            angular.forEach(manifestData['views'], function (v) {
                                if (v['id'] === view) {
                                    defer.resolve(v);
                                }
                            });
                            defer.reject();
                            return defer.promise;
                        };

                        var checkObservers = function (stateId, isInitialised) {

                            var defer = $q.defer();

                            $timeout(function () {
                                if (stateId !== 'root' && isInitialised) {
                                    ctrl.checkJsonObservers(stateId);
                                }
                            }, 0);

                            defer.resolve();

                            return defer.promise;

                        };

                        var loadTemplate = function (visId, templateFolder, template) {
                            var defer = $q.defer();
                            iframe.attr('src', templateFolder + '/' + template).attr('id', visId);
                            iframe.load(function () {
                                iframeContents = $(iframe.contents());
                                $compile(iframeContents)($scope);
                                defer.resolve();
                            });
                            return defer.promise;
                        };

                        var initEventsView = function (visId, templateFolder, viewData) {

                            var defer = $q.defer();

                            var eventsViewPath = viewData['events'] ? viewData['events'] : 'views/' + viewData['id'] + '.events.json';
                            $http.get(templateFolder + '/' + eventsViewPath)
                                .success(function (data) {
                                    // TODO: We need to validate the schema of the view data json file!
                                    angular.forEach(data['events'], function (e) {
                                        bmsVisualizationService.addEvent(visId, e, 'json');
                                    });
                                    defer.resolve();
                                })
                                .error(function () {
                                    // TODO: Do we need an error message? The view data json file should be optional!
                                    defer.resolve();
                                });

                            return defer.promise;

                        };

                        var initObserversView = function (visId, templateFolder, viewData) {

                            var defer = $q.defer();

                            // Get observer data from observers.json file
                            var observersViewPath = viewData['observers'] ? viewData['observers'] : 'views/' + viewData['id'] + '.observers.json';
                            $http.get(templateFolder + '/' + observersViewPath)
                                .success(function (data) {
                                    // TODO: We need to validate the schema of the view data json file!
                                    angular.forEach(data['observers'], function (o) {
                                        bmsVisualizationService.addObserver(visId, o, 'json');
                                    });
                                    defer.resolve();
                                })
                                .error(function () {
                                    // TODO: Do we need an error message? The view data json file should be optional!
                                    defer.resolve();
                                });

                            return defer.promise;

                        };

                        var initView = function (sessionId, view) {

                            bmsModalService.loading("Initialising View ...");

                            ctrl.sessionId = sessionId;
                            ctrl.view = view;

                            loadServerData(sessionId)
                                .then(function (serverData) {

                                    bmsUIService.setProBViewTraceId(serverData.traceId);
                                    ctrl.data = $.extend(ctrl.data, serverData);
                                    var templateFolder = serverData['templateFolder'];

                                    return loadManifestData(templateFolder)
                                        .then(function (manifestData) {
                                            return loadViewData(view, manifestData);
                                        })
                                        .then(function (viewData) {
                                            ctrl.data.view = viewData;
                                            initObserversView($scope.id, templateFolder, viewData)
                                                .then(function () {
                                                    return initEventsView($scope.id, templateFolder, viewData)
                                                })
                                                .then(function () {
                                                    return loadTemplate($scope.id, templateFolder, viewData.template)
                                                })
                                                .then(function () {
                                                    checkObservers(serverData.stateId, serverData.initialised);
                                                    $rootScope.$broadcast('visualizationLoaded', $scope.id, viewData);
                                                    bmsModalService.endLoading();
                                                });
                                        });

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
        .directive('bmsSvg', ['$http', 'bmsVisualizationService', '$rootScope', function ($http, bmsVisualizationService, $rootScope) {
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
