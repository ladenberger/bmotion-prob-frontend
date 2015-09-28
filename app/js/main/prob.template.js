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