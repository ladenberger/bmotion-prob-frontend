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

        var module = angular.module('prob.main', ['bms.main', 'prob.observers'])
            .config(['$controllerProvider', function ($controllerProvider) {
                module.registerCtrl = $controllerProvider.register;
            }])
            .run(["$rootScope", 'editableOptions', function ($rootScope, editableOptions) {

                $rootScope.getFormulaElements = function () {
                    return [];
                };

                /*$rootScope.formulaElements = [];
                 $rootScope.loadElements = function () {
                 $rootScope.formulaElements = [];
                 $('[data-hasobserver]').each(function (i, v) {
                 var el = $(v);
                 var observer = el.data("observer")["AnimationChanged"];
                 if (observer["formula"]) {
                 if (el.parents('svg').length) {
                 var id = $(v).attr("id");
                 if (id !== undefined) {
                 $rootScope.formulaElements.push({
                 value: $rootScope.formulaElements.length + 1,
                 text: '#' + id
                 })
                 }
                 }
                 }
                 });
                 };
                 $rootScope.getFormulaElements = function () {
                 return $rootScope.formulaElements;
                 };*/
                editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
            }])
            .factory('bmsScreenshotService', ['bmsVisualisationService', 'bmsObserverService', '$http', '$templateCache', '$injector', '$q', function (bmsVisualisationService, bmsObserverService, $http, $templateCache, $injector, $q) {

                var bmsScreenshotService = {

                    getStyle: function (path) {
                        var defer = $q.defer();
                        if (path !== undefined) {
                            $http.get(path, {cache: $templateCache}).success(function (style) {
                                defer.resolve('<style type="text/css">\n<![CDATA[\n' + style + '\n]]>\n</style>');
                            });
                        } else {
                            defer.resolve();
                        }
                        return defer.promise;
                    },
                    makeScreenshot: function (visualisationName, stateid) {

                        var defer = $q.defer();

                        var selected = bmsVisualisationService.getVisualisation(visualisationName);
                        var observerName = selected.observers;
                        var templateName = selected.template;
                        var styleName = selected.style;

                        // Load and evaluate observers and events
                        var observers = bmsObserverService.getObservers(observerName);

                        // Load template
                        $http.get(templateName, {cache: $templateCache}).success(function (tplContent) {

                            var contents = angular.element(tplContent);

                            // Give all elements an internal id
                            var count = 0;
                            $(contents).find("*").each(function (i, v) {
                                $(v).attr("data-bms-id", "bms" + count);
                                count++;
                            });

                            if (observers && stateid) {

                                var formulaObservers = {};
                                var promises = [];

                                $.each(observers, function (i, o) {

                                    if (o.type === 'formula') {
                                        var id = guid();
                                        formulaObservers[id] = o;
                                    } else {
                                        var observerInstance = $injector.get(o.type, "");
                                        if (observerInstance) {
                                            promises.push(observerInstance.check(o, contents, stateid));
                                        }
                                    }

                                });

                                // Special case for formula observers
                                if (!$.isEmptyObject(formulaObservers)) {
                                    // Execute formula observer at once (performance boost)
                                    var observerInstance = $injector.get("formula", "");
                                    promises.push(observerInstance.check(formulaObservers, contents, stateid));
                                }

                                // Collect values from observers
                                $q.all(promises).then(function (data) {

                                    var fvalues = {};
                                    angular.forEach(data, function (value) {
                                        if (value !== undefined) {
                                            $.extend(true, fvalues, value);
                                        }
                                    });

                                    for (bmsid in fvalues) {
                                        var nattrs = fvalues[bmsid];
                                        for (a in nattrs) {
                                            var orgElement = $(contents).find('[data-bms-id=' + bmsid + ']');
                                            $(orgElement).attr(a, nattrs[a]);
                                        }
                                    }

                                    bmsScreenshotService.getStyle(styleName).then(function (style) {
                                        if (style !== undefined) {
                                            contents.prepend(style);
                                        }
                                        var wrapper = $('<div>').append(contents);
                                        defer.resolve({
                                            stateid: stateid,
                                            html: wrapper.html()
                                        });
                                    });

                                });

                            }

                        });

                        return defer.promise;

                    }

                }

                return bmsScreenshotService;

            }])
            .factory('bmsVisualisationService', function () {
                var visualisations = {};
                return {
                    addVisualisation: function (name, observers, template, style) {
                        visualisations[name] = {
                            observers: observers,
                            template: template,
                            style: style
                        }
                    },
                    getVisualisations: function () {
                        return visualisations;
                    },
                    getVisualisation: function (name) {
                        return visualisations[name];
                    }
                }
            })
            .factory('initProB', ['$q', 'ws', 'initSession', function ($q, ws, initSession) {
                var defer = $q.defer();
                initSession.then(function (standalone) {
                    ws.emit('initProB', "", function (data) {
                        data.standalone = standalone;
                        defer.resolve(data);
                    });
                });
                return defer.promise;
            }])
            .directive('bmsVisualisationView', ['bmsVisualisationService', '$compile', 'bmsObserverService', '$http', '$templateCache', '$injector', '$timeout', 'ws', '$q', function (bmsVisualisationService, $compile, bmsObserverService, $http, $templateCache, $injector, $timeout, ws, $q) {
                return {
                    replace: false,
                    scope: true,
                    controller: ['$scope', function ($scope) {

                        $scope.observers = [];
                        $scope.events = [];
                        $scope.attrs = {};

                        $scope.getValues = function (bmsid) {
                            return $scope.values[bmsid];
                        };

                        $scope.getValue = function (bmsid, attr, defaultValue) {
                            var returnValue = defaultValue === 'undefined' ? undefined : defaultValue;
                            var ele = $scope.values[bmsid];
                            if (ele) {
                                returnValue = ele[attr] === undefined ? returnValue : ele[attr];
                            }
                            return returnValue;
                        };

                    }],
                    link: function ($scope, $element, attrs) {

                        // Save observers and events in current scope
                        $scope.observerName = attrs["bmsObservers"];
                        $scope.templateName = attrs["bmsTemplate"];
                        $scope.visualisationName = attrs["bmsName"];
                        $scope.style = attrs["bmsStyle"];

                        bmsVisualisationService.addVisualisation($scope.visualisationName, $scope.observerName, $scope.templateName, $scope.style);

                        // Load and evaluate observers and events
                        $.getScript($scope.observerName + ".js")
                            .done(function () {

                                $scope.observers = bmsObserverService.getObservers($scope.observerName);
                                $scope.events = bmsObserverService.getEvents($scope.observerName);

                                // Load template
                                $http.get($scope.templateName, {cache: $templateCache}).success(function (tplContent) {

                                    var contents = angular.element(tplContent);
                                    // Give all elements an internal id
                                    var count = 0;
                                    $(contents).find("*").each(function (i, v) {
                                        $(v).attr("data-bms-id", "bms" + count);
                                        count++;
                                    });

                                    // Setup events
                                    if ($scope.events) {
                                        $.each($scope.events, function (i, e) {
                                            var instance = $injector.get(e.type, "");
                                            if (instance) {
                                                instance.setup(e, contents);
                                            }
                                        });
                                    }

                                    $scope.setStateId = function (stateid, fn) {

                                        if ($scope.observers && stateid) {

                                            var formulaObservers = {};
                                            var promises = [];

                                            $.each($scope.observers, function (i, o) {

                                                if (o.type === 'formula') {
                                                    var id = guid();
                                                    formulaObservers[id] = o;
                                                } else {
                                                    var observerInstance = $injector.get(o.type, "");
                                                    if (observerInstance) {
                                                        promises.push(observerInstance.check(o, contents, stateid));
                                                    }
                                                }

                                            });

                                            // Special case for formula observers
                                            if (!$.isEmptyObject(formulaObservers)) {
                                                // Execute formula observer at once (performance boost)
                                                var observerInstance = $injector.get("formula", "");
                                                promises.push(observerInstance.check(formulaObservers, contents, stateid));
                                            }

                                            // Collect values from observers
                                            $q.all(promises).then(function (data) {

                                                var fvalues = {};
                                                angular.forEach(data, function (value) {
                                                    if (value !== undefined) {
                                                        $.extend(true, fvalues, value);
                                                    }
                                                });

                                                $scope.values = fvalues;

                                                var changed = false;
                                                for (bmsid in fvalues) {
                                                    var nattrs = fvalues[bmsid];
                                                    for (a in nattrs) {
                                                        if ($scope.attrs[bmsid] === undefined) {
                                                            $scope.attrs[bmsid] = [];
                                                        }
                                                        if ($.inArray(a, $scope.attrs[bmsid])) {
                                                            var orgElement = $(contents).find('[data-bms-id=' + bmsid + ']');
                                                            var attrDefault = $(orgElement).attr(a);
                                                            // Special case for class attributes
                                                            if (a === "class" && attrDefault === undefined) {
                                                                attrDefault = ""
                                                            }
                                                            $(orgElement).attr("ng-attr-" + a,
                                                                "{{getValue('" + bmsid + "','" + a + "','" + attrDefault + "')}}");
                                                            $scope.attrs[bmsid].push(a);
                                                            changed = true;
                                                        }
                                                    }
                                                }
                                                if (changed) {
                                                    $compile(contents.contents())($scope);
                                                }

                                                if (fn !== undefined) {
                                                    fn.call(this, stateid, contents.html());
                                                }

                                            });

                                        }

                                    };

                                    $($element).html($compile(contents)($scope));

                                    if (attrs['bmsStateid'] !== undefined) {
                                        $scope.setStateId(attrs['bmsStateid']);
                                    } else {
                                        ws.on('checkObserver', function (data) {
                                            if (data.stateid !== undefined) {
                                                $scope.setStateId(data.stateid);
                                            }
                                        });
                                        ws.emit("refresh");
                                    }

                                });

                            })
                            .fail(function () {
                            });

                        // In case of SVG we could also inline the styles ...
                        if ($scope.style) {
                            $("head").append($("<link rel='stylesheet' type='text/css' href='" + $scope.style + "' data-bms-style>"));
                        }

                    }
                }
            }]);

        prob.registerObservers = function (name, elements) {
            var injector = angular.element(document).injector(); // assuming `ng-app` is on the document
            var bmsObserverService = injector.get('bmsObserverService');
            bmsObserverService.addObservers(name, elements.observers);
            bmsObserverService.addEvents(name, elements.events);
        };

        return module;

    }
);
