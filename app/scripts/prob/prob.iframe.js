/**
 * BMotion Studio for ProB IFrame Module
 *
 */
define(['prob.api', 'bms.common', 'prob.observers', 'prob.modal'], function (prob) {

    var module = angular.module('prob.iframe', ['bms.common', 'prob.observers', 'prob.modal'])
        .directive('bmsVisualisationView', ['bmsMainService', '$rootScope', 'bmsVisualisationService', '$compile', 'bmsObserverService', '$http', 'loadModel', 'ws', '$injector', 'bmsUIService', 'bmsModalService', function (bmsMainService, $rootScope, bmsVisualisationService, $compile, bmsObserverService, $http, loadModel, ws, $injector, bmsUIService, bmsModalService) {
            return {
                replace: false,
                scope: true,
                template: '<iframe src="" frameBorder="0" style="width:100%;height:100%"></iframe>',
                link: function ($scope, $element, attrs) {

                    console.log("Init visualisation view ...");

                    var iframe = $element.contents();
                    $scope.id = attrs['bmsId'] ? attrs['bmsId'] : prob.uuid();
                    iframe.attr("data-bms-id", $scope.id).attr("id", $scope.id);

                    $scope.openTemplate = function (template) {

                        if (template) {

                            bmsModalService.startLoading();
                            bmsMainService.getFullPath(template).then(function (path) {

                                // Get properties from configuration file
                                $http.get(template).success(function (data) {

                                    if (data.model && data.tool) {

                                        // Load model
                                        loadModel.load({
                                            model: data.model,
                                            tool: data.tool,
                                            path: path
                                        }).then(function (r) {
                                            $scope.refinements = r.refinements;
                                            $scope.stateid = r.stateid;
                                            $scope.traceId = r.traceId;
                                            data.traceId = r.traceId;
                                            data.refinements = r.refinements;
                                            var jiframe = $(iframe);

                                            var filename = template.replace(/^.*[\\\/]/, '');
                                            jiframe.attr('src', template.replace(filename, '') + data.template);
                                            jiframe.load(function () {
                                                $rootScope.currentVisualisation = $scope.id;
                                                data.uuid = $scope.id;
                                                data.container = jiframe;
                                                data.path = path;
                                                $scope.container = jiframe;
                                                bmsVisualisationService.addVisualisation($scope.id, data);
                                                bmsUIService.setProBViewTraceId($scope.traceId);
                                                ws.on('checkObserver', function (data) {
                                                    if (data.stateid !== undefined && $scope.traceId == data.traceId) {
                                                        $scope.setStateId(data.stateid);
                                                    }
                                                });
                                                bmsModalService.endLoading();
                                            });
                                        });

                                    }

                                });

                            });

                        }

                    };

                    // TODO: Check if visualisation name was set
                    var fromParameter = prob.getUrlParameter("template");
                    $scope.openTemplate(fromParameter ? fromParameter : attrs["bmsVisualisationView"]);

                    $scope.$on('reloadVisualisation', function (evt, id) {
                        $scope.setStateId($scope.stateid);
                    });

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
                                var observer = {
                                    type: type,
                                    data: data,
                                    bmsid: $(e).attr("data-bms-id"),
                                    element: e
                                };
                                bmsObserverService.addObserver($scope.id, observer);
                                if ($scope.stateid !== 'root') {
                                    bmsObserverService.checkObserver(observer, $scope.container.contents(), $scope.stateid, $scope.traceId, $scope.id).then(function (data) {
                                        if (!prob.isEmpty(data)) {
                                            $scope.$broadcast('setValue', data);
                                        }
                                    });
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
                                instance.setup(event, iframe, $scope.traceId);
                            }
                        }
                    };

                    $scope.setStateId = function (stateid) {

                        var observers = bmsObserverService.getObservers($scope.id);

                        if (observers && stateid) {

                            $scope.stateid = stateid;
                            // Collect values from observers
                            bmsObserverService.checkObservers(observers, $scope.container.contents(), stateid, $scope.traceId, $scope.id).then(function (data) {
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
