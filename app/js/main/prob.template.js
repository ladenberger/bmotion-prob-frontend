/**
 * BMotion Studio for ProB Visualization Module
 *
 */
define([], function () {

    var observe = function (what, options) {
        setTimeout(function () {
            var parentScope = window.parent.angular.element(window.frameElement).scope();
            parentScope.addObserver(what, options, 'js');
        }, 0);
    };

    var registerEvent = function (type, options) {
        setTimeout(function () {
            var parentScope = window.parent.angular.element(window.frameElement).scope();
            parentScope.addEvent(type, options, 'js');
        }, 0);
    };

    var executeEvent = function (options) {
        setTimeout(function () {
            var parentScope = window.parent.angular.element(window.frameElement).scope();
            parentScope.addEvent('executeEvent', options, 'js');
        }, 0);
    };

    var eval = function (options) {
        setTimeout(function () {
            var parentScope = window.parent.angular.element(window.frameElement).scope();
            parentScope.eval(options);
        }, 0);
    };

    var on = function (what, callback) {
        setTimeout(function () {
            var parentScope = window.parent.angular.element(window.frameElement).scope();
            parentScope.on(what, callback);
        }, 0);
    };

    return {
        observe: observe,
        registerEvent: registerEvent,
        executeEvent: executeEvent,
        eval: eval,
        on: on,
        init: function (callback) {
            on("ModelInitialised", callback);
        }
    };

});