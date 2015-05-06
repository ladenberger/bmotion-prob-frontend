/**
 * BMotion Studio for ProB Visualization Module
 *
 */
define(['angularAMD', 'prob.api', 'angular', 'prob.jquery'], function (angularAMD, prob) {

    var module = angular.module('prob.vis.integrated', [])
        .factory('$parentScope', ['$window', function ($window) {
            return $window.parent.angular.element($window.frameElement).scope();
        }])
        .service('bmsJqueryService', ['$parentScope', function ($parentScope) {
            var observerService = {
                addObserver: function (type, data, element) {
                    $parentScope.addObserver(type, data, element);
                },
                addEvent: function (type, data, element) {
                    $parentScope.addEvent(type, data, element);
                }
            };
            return observerService;
        }])
        .directive('bmsVisualisation', ['$compile', '$parentScope', function ($compile, $parentScope) {
            return {
                scope: true,
                controller: ['$scope', function ($scope) {

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
                        $(v).attr("data-bms-id", "bms" + prob.uuid());
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
        }]);

    return angularAMD.bootstrap(module);

});