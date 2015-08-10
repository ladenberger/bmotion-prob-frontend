/**
 * BMotion Studio for ProB IFrame Module
 *
 */
define(['tv4', 'bms.func', 'prob.common', 'prob.observers', 'prob.modal'], function (tv4, bms) {

    var module = angular.module('prob.iframe.template', ['prob.common', 'prob.observers', 'prob.modal'])
        .factory('initSession', ['$q', 'ws', function ($q, ws) {
            return {
                init: function (data) {
                    var defer = $q.defer();
                    ws.emit('initSession', {data: data}, function (r) {
                        if (r.errors) {
                            defer.reject(r.errors)
                        } else {
                            defer.resolve(r)
                        }
                    });
                    return defer.promise;
                }
            };
        }])
        .directive('bmsVisualisationView', ['bmsMainService', '$rootScope', 'bmsVisualizationService', '$compile', 'bmsObserverService', '$http', 'initSession', 'ws', '$injector', 'bmsUIService', 'bmsModalService', 'manifest', 'trigger', '$q', function (bmsMainService, $rootScope, bmsVisualizationService, $compile, bmsObserverService, $http, initSession, ws, $injector, bmsUIService, bmsModalService, manifest, trigger, $q) {
            return {
                replace: false,
                scope: {
                    id: '@?bmsId',
                    template: '@bmsVisualisationView'
                },
                template: '<iframe src="" frameBorder="0" class="fullWidthHeight bmsIframe"></iframe>',
                controller: ['$scope', function ($scope) {

                    var self = this;

                    self.data = {};

                    self.checkObserver = function (observer, stateId, cause) {
                        stateId = stateId ? stateId : self.data.stateId;
                        cause = cause ? cause : trigger.TRIGGER_ANIMATION_CHANGED;
                        if (observer && stateId && trigger) {
                            bmsObserverService.checkObserver($scope.id, observer, self.data.container.contents(), stateId, cause)
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
                            bmsObserverService.checkObservers($scope.id, observers, self.data.container.contents(), stateId, cause).then(function (data) {
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
                                instance.setup($scope.id, evt, self.data.container.contents(), self.data.traceId);
                            }
                        });
                    };

                    self.initSession = function (template) {

                        var defer = $q.defer();

                        if (template) {

                            bmsMainService.getFullPath(template).then(function (fullPath) {

                                // Get properties from configuration file
                                $http.get(template).success(function (config) {

                                    if (tv4.validate(config, manifest.MANIFEST_SCHEME)) {

                                        self.data = {};

                                        //TODO: Check if template file exists ...

                                        var jsonFileName = template.replace(/^.*[\\\/]/, '');
                                        var templateFolder = template.replace(jsonFileName, '');
                                        var templateFile = config.template ? config.template : 'template.html';
                                        $.extend(self.data, config, {
                                            name: 'MyVisualization',
                                            template: templateFile,
                                            tool: 'BAnimation',
                                            templateFolder: templateFolder,
                                            templatePath: templateFolder + templateFile
                                        });

                                        initSession.init({
                                            model: self.data.model,
                                            tool: self.data.tool,
                                            id: $scope.id,
                                            path: fullPath
                                        }).then(function (modelData) {
                                            $.extend(self.data, modelData);
                                            defer.resolve();
                                        }, function (errors) {
                                            defer.reject(errors);
                                        });

                                    } else {
                                        defer.reject("BMotion manifest file (bmotion.json) invalid: " + tv4.error.message);
                                    }
                                }).error(function (data, status, headers, config) {
                                    if (status === 404) {
                                        defer.reject("File not found: " + config.url);
                                    } else {
                                        defer.reject("Some error occurred while requesting file " + config.url);
                                    }
                                });

                            });

                        } else {
                            defer.reject("No template specified");
                        }

                        return defer.promise;

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
                                instance.setup($scope.id, event, self.data.container.contents(), self.data.traceId);
                            }
                        }
                    };

                    ws.on('checkObserver', function (cause, s) {
                        var stateId = s.stateId;
                        var traceId = s.traceId;
                        self.data.stateId = stateId;
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
                    iframe.attr({
                        "data-bms-id": $scope.id,
                        "id": $scope.id
                    });

                    var openTemplate = function (template) {

                        bmsModalService.startLoading("Loading model ...");

                        ctrl.initSession(template).then(function () {

                            bmsModalService.setMessage("Loading visualization template ...");

                            $.extend(ctrl.data, {
                                container: iframe
                            });

                            iframe.attr('src', ctrl.data.templatePath).attr('id', $scope.id);
                            iframe.load(function () {
                                bmsVisualizationService.setCurrentVisualizationId($scope.id);
                                bmsVisualizationService.addVisualization($scope.id, ctrl.data);
                                bmsUIService.setProBViewTraceId(ctrl.data.traceId);
                                bmsModalService.endLoading();
                                $rootScope.$broadcast('visualizationLoaded', ctrl.data);
                            });

                        }, function (error) {
                            bmsModalService.setError(error);
                        });

                    };

                    var fromParameter = bms.getUrlParameter("template");
                    if (fromParameter) {
                        openTemplate(fromParameter);
                    }
                    attrs.$observe('bmsVisualisationView', function (vis) {
                        if (vis) openTemplate(vis);
                    });

                }
            }
        }]);

    return module;

});
