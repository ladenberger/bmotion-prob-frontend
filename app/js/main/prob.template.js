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
                }
            };
            return observerService;
        }]);

    angularAMD.bootstrap(module);

    var observe = function (what, options) {
        setTimeout(function () {
            var injector = angular.element(document).injector();
            var bmsParentService = injector.get('bmsParentService');
            bmsParentService.addObserver(what, options);
        }, 0);
    };

    var registerEvent = function (type, options) {
        setTimeout(function () {
            var injector = angular.element(document).injector();
            var bmsParentService = injector.get('bmsParentService');
            bmsParentService.addEvent(type, options);
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
        registerEvent: registerEvent,
        executeEvent: executeEvent
    };

});