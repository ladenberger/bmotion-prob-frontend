/**
 * BMotion Studio for ProB IFrame Module
 *
 */
define(['tv4', 'bms.func', 'prob.common', 'prob.observers', 'prob.modal'], function (tv4, bms) {

    var module = angular.module('prob.iframe', ['prob.common', 'prob.observers', 'prob.modal'])
        .directive('bmsVisualisationView', ['bmsMainService', '$rootScope', 'bmsVisualisationService', '$compile', 'bmsObserverService', '$http', 'initSession', 'ws', '$injector', 'bmsUIService', 'bmsModalService', 'manifest', 'trigger', '$q', function (bmsMainService, $rootScope, bmsVisualisationService, $compile, bmsObserverService, $http, initSession, ws, $injector, bmsUIService, bmsModalService, manifest, trigger, $q) {
            return {
                replace: false,
                scope: {},
                template: '<iframe src="" frameBorder="0" style="width:100%;height:100%"></iframe>',
                controller: ['$scope', function ($scope) {

                    var self = this;

                    self.data = {};

                    self.checkObserver = function (id, observer, stateId, trigger) {

                        bmsObserverService.checkObserver(id, observer, self.data.container.contents(), stateId, trigger).then(function (data) {
                            if (!bms.isEmpty(data)) {
                                $scope.$broadcast('setValue', data);
                            }
                        });

                    };

                    self.checkObservers = function (id, stateId, trigger) {

                        var observers = bmsObserverService.getObservers(id);

                        if (observers && stateId && trigger) {

                            // Collect values from observers
                            bmsObserverService.checkObservers(id, observers, self.data.container.contents(), stateId, trigger).then(function (data) {
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

                    self.initSession = function (template) {

                        var defer = $q.defer();

                        if (template) {

                            bmsMainService.getFullPath(template).then(function (fullPath) {

                                // Get properties from configuration file
                                $http.get(template).success(function (config) {

                                    if (tv4.validate(config, manifest.MANIFEST_SCHEME)) {

                                        var jsonFileName = template.replace(/^.*[\\\/]/, '');
                                        var templateFolder = template.replace(jsonFileName, '');
                                        $.extend(self.data, config, {
                                            templateFolder: templateFolder,
                                            templatePath: templateFolder + config.template
                                        });

                                        initSession.init({
                                            model: self.data.model,
                                            tool: self.data.tool,
                                            id: self.id,
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

                    $scope.addSvg = function (id, svg) {
                        bmsVisualisationService.addSvg(self.id, id, svg);
                    };

                    $scope.addObserver = function (type, data, element) {
                        var shouldAdd = true;
                        if (data.refinement) {
                            if ($.inArray(data.refinement, self.data.refinements) == -1) {
                                shouldAdd = false;
                            }
                        }
                        if (shouldAdd) {
                            var felement = element ? element : self.data.container.contents().find(data.selector);
                            felement.each(function (i, e) {
                                var jElement = $(e);
                                var bmsid = jElement.attr("data-bms-id");
                                if (!bmsid) {
                                    bmsid = bms.uuid();
                                    jElement.attr("data-bms-id", bmsid);
                                }
                                var observer = {
                                    type: type,
                                    data: data,
                                    bmsid: bmsid,
                                    element: e
                                };
                                bmsObserverService.addObserver(self.id, observer);
                                if (self.data.stateId !== 'root' && self.data.initialised) {
                                    self.checkObserver(self.id, observer, self.data.stateId, data.cause);
                                }
                            });
                        }
                    };

                    $scope.addEvent = function (type, data, element) {
                        var shouldAdd = true;
                        if (data.refinement) {
                            if ($.inArray(data.refinement, self.data.refinements) == -1) {
                                shouldAdd = false;
                            }
                        }
                        if (shouldAdd) {
                            if (element) {
                                data.selector = element.selector;
                            }
                            var event = {
                                type: type,
                                data: data,
                                element: element
                            };
                            bmsObserverService.addEvent(self.id, event);
                            var instance = $injector.get(type, "");
                            if (instance) {
                                instance.setup(self.id, event, self.data.container.contents(), self.data.traceId);
                            }
                        }
                    };

                }],
                link: function ($scope, $element, attrs, ctrl) {

                    var iframe = $($element.contents());
                    ctrl.id = attrs['bmsId'] ? attrs['bmsId'] : bms.uuid();
                    iframe.attr({
                        "data-bms-id": ctrl.id,
                        "id": ctrl.id
                    });

                    var openTemplate = function (template) {

                        bmsModalService.startLoading();
                        ctrl.initSession(template).then(function () {

                            $.extend(ctrl.data, {
                                container: iframe
                            });

                            iframe.attr('src', ctrl.data.templatePath).attr('id', ctrl.id);
                            iframe.load(function () {
                                $rootScope.currentVisualisation = ctrl.id;
                                bmsVisualisationService.addVisualisation(ctrl.id, ctrl.data);
                                bmsUIService.setProBViewTraceId(ctrl.data.traceId);
                                ws.on('checkObserver', function (cause, s) {
                                    var stateId = s.stateId;
                                    var traceId = s.traceId;
                                    ctrl.data.stateId = stateId;
                                    if (cause === trigger.TRIGGER_MODEL_INITIALISED) {
                                        ctrl.data.initialised = true;
                                    }
                                    if (ctrl.data.traceId == traceId) {
                                        ctrl.checkObservers(ctrl.data.id, stateId, cause);
                                    }
                                });
                                bmsModalService.endLoading();
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

    /*prob.registerObservers = function (name, elements) {
     var injector = angular.element(document).injector();
     var bmsObserverService = injector.get('bmsObserverService');
     bmsObserverService.addObservers(name, elements.observers);
     bmsObserverService.addEvents(name, elements.events);
     };

     prob.registerObserver = function (name, observer) {
     var injector = angular.element(document).injector();
     var bmsObserverService = injector.get('bmsObserverService');
     bmsObserverService.addObserver(name, observer);
     };

     prob.registerEvent = function (name, event) {
     var injector = angular.element(document).injector();
     var bmsObserverService = injector.get('bmsObserverService');
     bmsObserverService.addEvent(name, event);
     };*/

    return module;

});
