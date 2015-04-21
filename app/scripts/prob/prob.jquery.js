/**
 * BMotion Studio for ProB jQuery Module
 *
 */
define(['prob.api'], function (prob) {

    var observePredicate = function (options, origin) {
        var settings = prob.normalize($.extend({
            predicate: "",
            true: [],
            false: [],
            cause: "AnimationChanged",
            callback: function () {
            }
        }, options), ["callback", "false", "true"], origin);
        var injector = angular.element(document).injector();
        var bmsObserverService = injector.get('bmsJqueryService');
        bmsObserverService.addObserver('predicate', settings, origin);
    };

    var observeCSPTrace = function (options, origin) {
        var settings = prob.normalize($.extend({
            observers: [],
            selector: "",
            cause: "AnimationChanged"
        }, options), [], origin);
        var injector = angular.element(document).injector();
        var bmsObserverService = injector.get('bmsJqueryService');
        bmsObserverService.addObserver('csp-event', settings, origin);
    };

    var observeRefinement = function (options, origin) {
        var settings = prob.normalize($.extend({
            refinements: [],
            cause: "ModelChanged",
            enable: function () {
            },
            disable: function () {
            }
        }, options), ["enable", "disable"], origin);
        var injector = angular.element(document).injector();
        var bmsObserverService = injector.get('bmsJqueryService');
        bmsObserverService.addObserver('refinement', settings, origin);
    };

    /*var observeMethod = function (options, origin) {
     var settings = prob.normalize($.extend({
     name: "",
     cause: "AnimationChanged",
     trigger: function () {
     }
     }, options), ["trigger"], origin);
     addObserver("method", settings, function () {
     socket.emit("callMethod", {data: settings}, function (data) {
     origin !== undefined ? settings.trigger.call(this, $(origin), data) : settings.trigger.call(this, data)
     });
     }, origin);
     return settings
     };*/

    var observeFormula = function (options, origin) {
        var settings = prob.normalize($.extend({
            formulas: [],
            cause: "AnimationChanged",
            trigger: function () {
            }
        }, options), ["trigger"], origin);
        var injector = angular.element(document).injector();
        var bmsObserverService = injector.get('bmsJqueryService');
        bmsObserverService.addObserver('formula', settings, origin);
    };

    var observe = function (what, options, origin) {
        if (what === "formula") {
            observeFormula(options, origin)
        }
        if (what === "method") {
            //observeMethod(options, origin)
        }
        if (what === "refinement") {
            observeRefinement(options, origin)
        }
        if (what === "predicate") {
            observePredicate(options, origin)
        }
        if (what === "csp-event") {
            observeCSPTrace(options, origin)
        }
    };

    // ---------------------
    // jQuery extension
    // ---------------------
    (function ($) {

        $.fn.observe = function (what, options) {
            observe(what, options, this);
            return this
        };

        $.fn.executeEvent = function (options) {
            var element = this;
            var injector = angular.element(document).injector();
            var bmsObserverService = injector.get('bmsJqueryService');
            bmsObserverService.addEvent('executeEvent', options, element);
        };

    }(jQuery));

});
