/**
 * BMotion Studio for ProB Main Module
 *
 */
define(['prob.api', 'bmotion.main', 'prob.observers', 'jquery', 'tooltipster'], function (prob) {

        var guid = (function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return function () {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            };
        })();

        function isEmpty(map) {
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        }

        var module = angular.module('prob.main', ['bms.main', 'prob.observers'])
            .config(['$controllerProvider', function ($controllerProvider) {
                module.registerCtrl = $controllerProvider.register;
            }])
            .factory('loadModel', ['$q', 'ws', function ($q, ws) {
                return {
                    load: function (data) {
                        var defer = $q.defer();
                        ws.emit('loadModel', {data: data}, function (r) {
                            defer.resolve(r)
                        });
                        return defer.promise;
                    }
                };
            }])
            .run(["$rootScope", 'editableOptions', function ($rootScope, editableOptions) {
                editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
            }])
            .factory('bmsScreenshotService', ['bmsVisualisationService', 'bmsObserverService', '$http', '$templateCache', '$injector', '$q', function (bmsVisualisationService, bmsObserverService, $http, $templateCache, $injector, $q) {

                var bmsScreenshotService = {

                    getStyle: function (template, style) {
                        var defer = $q.defer();
                        if (style) {
                            $http.get(template + "/" + style, {cache: $templateCache}).success(function (css) {
                                defer.resolve('<style type="text/css">\n<![CDATA[\n' + css + '\n]]>\n</style>');
                            });
                        } else {
                            defer.resolve();
                        }
                        return defer.promise;
                    }

                };

                return bmsScreenshotService;

            }])
            .factory('bmsVisualisationService', function () {
                var visualisations = {};
                return {
                    addVisualisation: function (name, data) {
                        visualisations[name] = data;
                    },
                    getVisualisations: function () {
                        return visualisations;
                    },
                    getVisualisation: function (name) {
                        return visualisations[name];
                    }
                }
            })
            .directive('bmsVisualisationView', ['bmsVisualisationService', '$compile', 'bmsObserverService', '$http', 'loadModel', 'ws', '$injector', '$q', function (bmsVisualisationService, $compile, bmsObserverService, $http, loadModel, ws, $injector, $q) {
                return {
                    replace: false,
                    scope: true,
                    template: '<iframe src="" frameBorder="0" style="width:100%;height:100%"></iframe>',
                    controller: ['$scope', function ($scope) {

                        ws.on('checkObserver', function (data) {
                            if (data.stateid !== undefined) {
                                $scope.setStateId(data.stateid);
                            }
                        });

                    }],
                    link: function ($scope, $element, attrs) {

                        console.log("Init visualisation view ...");

                        var iframe = $element.contents();
                        var uuid = guid();
                        iframe.attr("data-bms-id", uuid);

                        $scope.visualisation = attrs["bmsVisualisationView"];

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
                                    bmsObserverService.addObserver($scope.visualisation, observer);
                                    bmsObserverService.checkObserver(observer, $scope.container.contents(), $scope.stateid).then(function (data) {
                                        if (!isEmpty(data)) {
                                            $scope.$broadcast('setValue', data);
                                        }
                                    });
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
                                bmsObserverService.addEvent($scope.visualisation, event);
                                var instance = $injector.get(type, "");
                                if (instance) {
                                    instance.setup(event, iframe);
                                }
                            }
                        };

                        // Get properties from configuration file
                        $http.get($scope.visualisation + '/bmotion.json').success(function (data) {

                            $scope.template = data.template;
                            $scope.model = data.model;
                            $scope.tool = data.tool;
                            $scope.name = data.name;
                            $scope.view = data.view; // TODO: Check if SVG element

                            loadModel.load({
                                model: $scope.model,
                                tool: $scope.tool,
                                visualisation: $scope.visualisation
                            }).then(function (r) {
                                $scope.refinements = r.refinements;
                                $scope.stateid = r.stateid;
                                var jiframe = $(iframe);
                                jiframe.attr('src', $scope.visualisation + '/' + $scope.template);
                                jiframe.load(function () {
                                    // Give all elements an internal id
                                    var count = 0;
                                    $(this).contents().find('body').find("*").each(function (i, v) {
                                        $(v).attr("data-bms-id", "bms" + count);
                                        count++;
                                    });
                                    data.uuid = uuid;
                                    data.container = jiframe;
                                    $scope.container = jiframe;
                                    bmsVisualisationService.addVisualisation($scope.visualisation, data);
                                });
                            });

                        });

                        $scope.setStateId = function (stateid) {

                            var observers = bmsObserverService.getObservers($scope.visualisation);

                            if (observers && stateid) {

                                // Collect values from observers
                                bmsObserverService.checkObservers(observers, $scope.container.contents(), stateid).then(function (data) {
                                    var fvalues = {};
                                    angular.forEach(data, function (value) {
                                        if (value !== undefined) {
                                            $.extend(true, fvalues, value);
                                        }
                                    });
                                    if (!isEmpty(fvalues)) {
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

    }
);
