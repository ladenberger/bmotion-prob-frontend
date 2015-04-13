define(['angularAMD', 'prob.jquery'], function (angularAMD) {

    var module = angular.module('prob.vis', [])
        .factory('$parentScope', function ($window) {
            return $window.parent.angular.element($window.frameElement).scope();
        })
        .service('bmsObserverService', function ($parentScope) {
            var observerService = {
                addObserver: function (type, data, element) {
                    $parentScope.addObserver(type, data, element);
                },
                addEvent: function (type, data, element) {
                    $parentScope.addEvent(type, data, element);
                }
            };
            return observerService;
        })
        .directive('bmsVisualisation', ['$compile', '$parentScope', function ($compile, $parentScope) {
            return {
                replace: false,
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

                    $parentScope.$on('changeValues', function (e, values) {
                        $scope.values = values;
                        $scope.$apply();
                    });

                }],
                link: function ($scope, $element) {

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

                    });

                }
            }
        }]);

    return angularAMD.bootstrap(module);

});