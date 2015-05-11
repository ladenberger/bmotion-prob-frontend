/**
 * BMotion Studio for ProB IFrame Module
 *
 */
define(['prob.api', 'tv4', 'prob.common', 'prob.observers', 'prob.modal'], function (prob, tv4) {

    var module = angular.module('prob.iframe', ['prob.common', 'prob.observers', 'prob.modal'])
        .directive('bmsVisualisationView', ['bmsMainService', '$rootScope', 'bmsVisualisationService', '$compile', 'bmsObserverService', '$http', 'initSession', 'ws', '$injector', 'bmsUIService', 'bmsModalService', 'manifest', 'trigger', function (bmsMainService, $rootScope, bmsVisualisationService, $compile, bmsObserverService, $http, initSession, ws, $injector, bmsUIService, bmsModalService, manifest, trigger) {
            return {
                replace: false,
                scope: true,
                template: '<iframe src="" frameBorder="0" style="width:100%;height:100%"></iframe>',
                link: function ($scope, $element, attrs) {

                    console.log("Init visualisation view ...");

                    var iframe = $element.contents();
                    $scope.id = attrs['bmsId'] ? attrs['bmsId'] : prob.uuid();
                    iframe.attr("data-bms-id", $scope.id);
                    iframe.attr("id", $scope.id);

                    $scope.openTemplate = function (template) {

                        if (template) {

                            bmsModalService.startLoading();
                            bmsMainService.getFullPath(template).then(function (path) {

                                // Get properties from configuration file
                                $http.get(template).success(function (data) {

                                    if (tv4.validate(data, manifest.MANIFEST_SCHEME)) {

                                        if (data.model && data.tool) {

                                            // Load model
                                            initSession.init({
                                                model: data.model,
                                                tool: data.tool,
                                                id: $scope.id,
                                                path: path
                                            }).then(function (r) {
                                                $scope.refinements = r.refinements;
                                                $scope.stateId = r.stateId;
                                                $scope.traceId = r.traceId;
                                                $scope.initialised = r.initialised;
                                                $scope.id = $scope.id;
                                                data.traceId = r.traceId;
                                                data.refinements = r.refinements;
                                                var jiframe = $(iframe);
                                                var filename = template.replace(/^.*[\\\/]/, '');
                                                var templatePath = template.replace(filename, '');
                                                jiframe.attr('src', templatePath + data.template).attr('id', r.id);
                                                jiframe.load(function () {
                                                    $rootScope.currentVisualisation = $scope.id;
                                                    data.id = $scope.id;
                                                    data.container = jiframe;
                                                    data.path = path;
                                                    data.templatePath = templatePath;
                                                    $scope.container = jiframe;
                                                    bmsVisualisationService.addVisualisation($scope.id, data);
                                                    bmsUIService.setProBViewTraceId($scope.traceId);
                                                    ws.on('checkObserver', function (cause, data) {
                                                        var stateId = data.stateId;
                                                        var traceId = data.traceId;
                                                        $scope.stateId = stateId;
                                                        if (cause === trigger.TRIGGER_MODEL_INITIALISED) {
                                                            $scope.initialised = true;
                                                        }
                                                        if ($scope.traceId == traceId) {
                                                            $scope.checkObservers($scope.id, stateId, cause);
                                                        }
                                                    });
                                                    bmsModalService.endLoading();
                                                });
                                            }, function (errors) {
                                                bmsModalService.setError(errors);
                                            });

                                        }

                                    } else {
                                        bmsModalService.setError("BMotion manifest file invalid (bmotion.json): " + tv4.error.message);
                                    }
                                }).error(function (data, status, headers, config) {
                                    if (status === 404) {
                                        bmsModalService.setError("File not found: " + config.url);
                                    } else {
                                        bmsModalService.setError("Some error occurred while requesting file " + config.url);
                                    }
                                });

                            });

                        } else {
                            bmsModalService.setError("No template specified");
                        }

                    };

                    // TODO: Check if visualisation name was set
                    var fromParameter = prob.getUrlParameter("template");
                    $scope.openTemplate(fromParameter ? fromParameter : attrs["bmsVisualisationView"]);

                    /*$scope.$on('reloadVisualisation', function (evt, id) {
                     $scope.setStateId($scope.stateId);
                     });*/

                    $scope.$on('openTemplate', function (evt, template) {
                        $scope.openTemplate(template);
                    });

                    $scope.addObserver = function (type, data, element) {
                        var shouldAdd = true;
                        if (data.refinement) {
                            if ($.inArray(data.refinement, $scope.refinements) == -1) {
                                shouldAdd = false;
                            }
                        }
                        if (shouldAdd) {
                            var felement = element ? element : iframe.contents().find(data.selector);
                            felement.each(function (i, e) {
                                var jElement = $(e);
                                var bmsid = jElement.attr("data-bms-id");
                                if (!bmsid) {
                                    bmsid = prob.uuid();
                                    jElement.attr("data-bms-id", bmsid);
                                }
                                var observer = {
                                    type: type,
                                    data: data,
                                    bmsid: bmsid,
                                    element: e
                                };
                                bmsObserverService.addObserver($scope.id, observer);
                                if ($scope.stateId !== 'root' && $scope.initialised) {
                                    $scope.checkObserver($scope.id, observer, $scope.stateId, data.cause);
                                }
                            });
                        }
                    };

                    $scope.addEvent = function (type, data, element) {
                        var shouldAdd = true;
                        if (data.refinement) {
                            if ($.inArray(data.refinement, $scope.refinements) == -1) {
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
                            bmsObserverService.addEvent($scope.id, event);
                            var instance = $injector.get(type, "");
                            if (instance) {
                                instance.setup($scope.id, event, iframe, $scope.traceId);
                            }
                        }
                    };

                    $scope.checkObserver = function (id, observer, stateId, trigger) {

                        bmsObserverService.checkObserver(id, observer, $scope.container.contents(), stateId, trigger).then(function (data) {
                            if (!prob.isEmpty(data)) {
                                $scope.$broadcast('setValue', data);
                            }
                        });

                    };

                    $scope.checkObservers = function (id, stateId, trigger) {

                        var observers = bmsObserverService.getObservers(id);

                        if (observers && stateId && trigger) {

                            // Collect values from observers
                            bmsObserverService.checkObservers(id, observers, $scope.container.contents(), stateId, trigger).then(function (data) {
                                var fvalues = {};
                                angular.forEach(data, function (value) {
                                    if (value !== undefined) {
                                        $.extend(true, fvalues, value);
                                    }
                                });
                                if (!prob.isEmpty(fvalues)) {
                                    $scope.$broadcast('changeValues', fvalues);
                                }
                            });

                        }

                    };

                }
            }
        }]);

    prob.registerObservers = function (name, elements) {
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
    };

    return module;

});
