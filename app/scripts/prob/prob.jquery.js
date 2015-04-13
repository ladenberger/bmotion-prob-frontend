/**
 * BMotion Studio for ProB jQuery Module
 *
 */
define(['bmotion.func', 'jquery'], function (bms) {

    var observePredicate = function (options, origin) {

        var settings = bms.normalize($.extend({
            predicate: "",
            true: [],
            false: [],
            cause: "AnimationChanged",
            callback: function () {
            }
        }, options), ["callback", "false", "true"], origin);
        setTimeout(function () {
            var injector = angular.element(document).injector();
            var bmsObserverService = injector.get('bmsObserverService');
            bmsObserverService.addObserver('predicate', settings, origin);
        }, 0);

    };

    var observeCSPTrace = function (options, origin) {

        var settings = bms.normalize($.extend({
            observers: [],
            selector: "",
            cause: "AnimationChanged"
        }, options), [], origin);
        setTimeout(function () {
            var injector = angular.element(document).injector();
            var bmsObserverService = injector.get('bmsObserverService');
            bmsObserverService.addObserver('csp-event', settings, origin);
        }, 0);

    };

    var observeRefinement = function (options, origin) {
        var settings = bms.normalize($.extend({
            refinements: [],
            cause: "ModelChanged",
            enable: function () {
            },
            disable: function () {
            }
        }, options), ["enable", "disable"], origin);
        setTimeout(function () {
            var injector = angular.element(document).injector();
            var bmsObserverService = injector.get('bmsObserverService');
            bmsObserverService.addObserver('refinement', settings, origin);
        }, 0);
    };

    /*var observeMethod = function (options, origin) {
     var settings = bms.normalize($.extend({
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
        var settings = bms.normalize($.extend({
            formulas: [],
            cause: "AnimationChanged",
            trigger: function () {
            }
        }, options), ["trigger"], origin);
        setTimeout(function () {
            var injector = angular.element(document).injector();
            var bmsObserverService = injector.get('bmsObserverService');
            bmsObserverService.addObserver('formula', settings, origin);
        }, 0);
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
            //this.each(function (i, v) {
            observe(what, options, this);
            //});
            return this
        };

        $.fn.executeEvent = function (options) {
            var element = this;
            setTimeout(function () {
                var injector = angular.element(document).injector();
                var bmsObserverService = injector.get('bmsObserverService');
                bmsObserverService.addEvent('executeEvent', options, element);
            }, 0);
        };

    }(jQuery));

});
