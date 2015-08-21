/**
 * BMotion Studio for ProB Visualization Module
 *
 */
define(['bms.func', 'angularAMD', 'angular', 'jquery'], function (bms, angularAMD) {

    var module = angular.module('prob.template', [])
        .factory('$parentScope', ['$window', function ($window) {
            return $window.parent.angular.element($window.frameElement).scope();
        }])
        .service('bmsParentService', ['$parentScope', function ($parentScope) {
            var observerService = {
                addObserver: function (type, data) {
                    $parentScope.addObserver(type, data);
                    $parentScope.$apply();
                },
                addEvent: function (type, data) {
                    $parentScope.addEvent(type, data);
                    $parentScope.$apply();
                },
                addSvg: function (svg) {
                    $parentScope.addSvg(svg);
                    $parentScope.$apply();
                }
            };
            return observerService;
        }])
        .directive('bmsVisualisation', ['$compile', '$parentScope', function ($compile, $parentScope) {
            return {
                scope: {},
                controller: ['$scope', function ($scope) {

                    $scope.attrs = {};

                    $scope.getValue = function (bmsid, attr, defaultValue) {
                        var returnValue = defaultValue === 'undefined' ? undefined : defaultValue;
                        var ele = $scope.values[bmsid];
                        if (ele) {
                            returnValue = ele[attr] === undefined ? returnValue : ele[attr];
                        }
                        return returnValue;
                    };

                    $parentScope.$on('setValue', function (e, value) {
                        $scope.values = $.extend(true, $scope.values, value);
                        $scope.$apply();
                    });

                    $parentScope.$on('changeValues', function (e, values) {
                        $scope.values = values;
                        $scope.$apply();
                    });

                }],
                link: function ($scope, $element) {

                    // Give all elements an internal id
                    $(document).find('body').find("*").each(function (i, v) {
                        $(v).attr("data-bms-id", "bms" + bms.uuid());
                    });

                    $scope.$watch('values', function () {

                        var changed = false;
                        for (bmsid in $scope.values) {
                            var nattrs = $scope.values[bmsid];
                            for (var a in nattrs) {
                                if ($scope.attrs[bmsid] === undefined) {
                                    $scope.attrs[bmsid] = [];
                                }
                                if ($.inArray(a, $scope.attrs[bmsid])) {
                                    var orgElement = $($element).contents().find('[data-bms-id=' + bmsid + ']');
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
                            $compile($element.contents())($scope);
                        }
                    }, true);

                }
            }
        }])
        .directive('bmsSvg', ['bmsParentService', '$parentScope', '$compile', '$http', function (bmsParentService, $parentScope, $compile, $http) {
            return {
                replace: false,
                transclude: true,
                scope: {
                    svg: '@bmsSvg'
                },
                /*,
                 templateUrl: function (elem, attrs) {
                 return attrs['bmsSvg'];
                 },*/
                controller: ['$scope', function ($scope) {
                    bmsParentService.addSvg($scope.svg);
                }],
                link: function ($scope, element) {

                    var reloadTemplate = function () {
                        return $http.get($scope.svg).success(function (svg) {
                            element.html(svg);
                        });
                    };
                    reloadTemplate();

                    $parentScope.$on('visualizationSaved', function () {
                        reloadTemplate().then(function () {
                            $compile(element.contents())($scope);
                            $parentScope.$broadcast('reloadTemplate');
                        });
                    });

                }
            }
        }]);

    angularAMD.bootstrap(module);

    var observeFormula = function (options) {
        var settings = bms.normalize($.extend({
            formulas: [],
            cause: "AnimationChanged",
            trigger: function () {
            }
        }, options), ["trigger"]);
        var injector = angular.element(document).injector();
        var bmsObserverService = injector.get('bmsParentService');
        bmsObserverService.addObserver('formula', settings);
    };

    var observeCSPEvent = function (options) {
        var settings = bms.normalize($.extend({
            cause: "AnimationChanged",
            observers: []
        }, options), []);
        var injector = angular.element(document).injector();
        var bmsObserverService = injector.get('bmsParentService');
        bmsObserverService.addObserver('csp-event', settings);
    };

    var observe = function (what, options) {
        setTimeout(function () {
            if (what === "formula") {
                observeFormula(options);
            } else if (what === "csp-event") {
                observeCSPEvent(options);
            }
        }, 0);
    };

    var executeEvent = function (options) {
        setTimeout(function () {
            var injector = angular.element(document).injector();
            var bmsObserverService = injector.get('bmsParentService');
            bmsObserverService.addEvent('executeEvent', options);
        }, 0);
    };

    return {
        observe: observe,
        executeEvent: executeEvent
    };

});