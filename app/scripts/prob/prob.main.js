/**
 * BMotion Studio for ProB Main Module
 *
 */
define(['prob.api', 'bmotion.main', 'jquery'], function (prob) {

        var module = angular.module('prob.main', ['bms.main'])
            .config(['$controllerProvider', function ($controllerProvider) {
                module.registerCtrl = $controllerProvider.register;
            }])
            .run(["$rootScope", 'editableOptions', function ($rootScope, editableOptions) {
                $rootScope.formulaElements = [];
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
                };
                editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
            }])
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
            .service('bmsObserverService', function () {
                var observers = {};
                return {
                    addObservers: function (name, obs) {
                        observers[name] = obs
                    },
                    getObservers: function (name) {
                        return observers[name];
                    }
                }
            })
            .directive('bmsVisualisationViewCompiled', ['bmsObserverService', function (bmsObserverService) {
                return {
                    replace: false,
                    scope: true,
                    link: function ($scope, $element, attrs) {

                        // Rename id attribute to data-bms-id attribute in order to avoid duplicated id's
                        var idElements = $($element).find('[id]');
                        idElements.each(function (i, v) {
                            var ele = $(v);
                            ele.attr("data-bms-id", ele.attr("id"));
                            ele.removeAttr("id");
                        });

                        var observerFuncName = attrs["bmsObservers"];
                        var observers = bmsObserverService.getObservers(observerFuncName);
                        $.each(observers, function (i, v) {
                            var selector = v.selector.indexOf("#") === 0 ? "[data-bms-id=" + v.selector.substr(1, v.selector.length - 1) + "]" : v.selector;
                            var element = $($element).find(selector);
                            if (v.type === 'executeEvent') {
                                element.executeEvent(v.data);
                            } else {
                                element.observe(v.type, v.data);
                            }
                            bmotion.checkObserver()
                        });

                    }
                }
            }])
            .directive('bmsVisualisationView', ['$compile', function ($compile) {
                return {
                    replace: false,
                    controller: ['$scope', function ($scope) {
                    }],
                    link: function ($scope, $element, attrs) {
                        var observerFuncName = attrs["bmsObservers"];
                        var style = attrs["bmsStyleFile"];
                        var templateName = attrs["bmsTemplate"];
                        $.getScript(observerFuncName + ".js")
                            .done(function () {
                                $element.replaceWith($compile('<div bms-visualisation-view-compiled data-bms-observers="' + observerFuncName + '" ng-controller="liftObservers" ng-include="getContentUrl()"></div>')($scope));
                            })
                            .fail(function () {
                            });
                        $scope.getContentUrl = function () {
                            return templateName;
                        };
                        $scope.getObserverFuncName = function () {
                            return observerFuncName;
                        };
                        if (style) {
                            // In case of SVG we could also inline the styles ...
                            $("head").append($("<link rel='stylesheet' type='text/css' href='" + style + "' data-bms-style>"));
                        }
                        //var content = $element.children();
                        /*var observerData = observerDataList[observerFuncName];
                         if (observerData) {
                         $.each(observerData, function (i, o) {
                         console.log(o.type);
                         if (o.type === 'executeEvent') {
                         console.log(o)
                         }
                         });
                         }
                         if (style) {
                         $("head").append($("<link rel='stylesheet' type='text/css' href='" + style + "' data-bms-style>"));
                         }*/
                    }
                    //template: '<div ng-include="getContentUrl()"></div>'
                }
            }]);

        prob.registerObservers = function (name, obs) {
            module.registerCtrl(name, ['$scope', 'bmsObserverService', function ($scope, bmsObserverService) {
                bmsObserverService.addObservers(name, obs);
            }]);
        };

        return module;

        //return $.extend(bmotion, {config: config}, probFunctions, {module: angularAMD.bootstrap(probModule)});

    }
);
