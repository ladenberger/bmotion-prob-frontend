/**
 * BMotion Studio for ProB Visualization Module
 *
 */
define(['angularAMD', 'angular', 'jquery'], function (angularAMD) {

    var module = angular.module('prob.template', [])
        .factory('$parentScope', ['$window', function ($window) {
            return $window.parent.angular.element($window.frameElement).scope();
        }])
        .factory('bmsParentService', ['$parentScope', function ($parentScope) {
            var observerService = {
                addObserver: function (type, data) {
                    $parentScope.addObserver(type, data);
                },
                addEvent: function (type, data) {
                    $parentScope.addEvent(type, data);
                },
                addSvg: function (svg) {
                    $parentScope.addSvg(svg);
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

                    // Set only new values
                    $parentScope.$on('setValue', function (e, value) {
                        $scope.values = $.extend(true, $scope.values, value);
                        $scope.$apply();
                    });

                    // Set and replace all values
                    $parentScope.$on('changeValues', function (e, values) {
                        $scope.values = values;
                        $scope.$apply();
                    });

                }],
                link: function ($scope, $element) {

                    var contents = $($element).contents();

                    $scope.$watch('values', function (values) {
                        for (bmsid in values) {
                            var nattrs = values[bmsid];
                            for (var a in nattrs) {
                                if ($scope.attrs[bmsid] === undefined) {
                                    $scope.attrs[bmsid] = [];
                                }
                                if ($.inArray(a, $scope.attrs[bmsid])) {
                                    var orgElement = contents.find('[data-bms-id=' + bmsid + ']');
                                    var attrDefault = orgElement.attr(a);
                                    // Special case for class attributes
                                    if (a === "class" && attrDefault === undefined) {
                                        attrDefault = ""
                                    }
                                    orgElement.attr("ng-attr-" + a,
                                        "{{getValue('" + bmsid + "','" + a + "','" + attrDefault + "')}}");
                                    $scope.attrs[bmsid].push(a);
                                    $compile(orgElement)($scope);
                                }
                            }
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

                    /*$parentScope.$on('visualizationSaved', function () {
                     reloadTemplate().then(function () {
                     $compile(element.contents())($scope);
                     $parentScope.$broadcast('reloadTemplate');
                     });
                     });*/

                }
            }
        }]);

    angularAMD.bootstrap(module);

    var observe = function (what, options) {
        setTimeout(function () {
            var injector = angular.element(document).injector();
            var bmsParentService = injector.get('bmsParentService');
            bmsParentService.addObserver(what, options);
        }, 0);
    };

    var executeEvent = function (options) {
        setTimeout(function () {
            var injector = angular.element(document).injector();
            var bmsParentService = injector.get('bmsParentService');
            bmsParentService.addEvent('executeEvent', options);
        }, 0);
    };

    return {
        observe: observe,
        executeEvent: executeEvent
    };

});