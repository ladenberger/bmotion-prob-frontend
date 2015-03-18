/**
 * General BMotion Studio module
 *
 */
define(['bmotion.socket', 'bmotion.config', 'angular-route'], function (socket, config) {

        return angular.module('bms.main', ['ngRoute'])
            .factory('ws', ['$rootScope', function ($rootScope) {
                'use strict';
                return {
                    emit: function (event, data, callback) {
                        socket.emit(event, data, function () {
                            var args = arguments;
                            $rootScope.$apply(function () {
                                if (callback) {
                                    callback.apply(null, args);
                                }
                            });
                        });
                    },
                    on: function (event, callback) {
                        socket.on(event, function () {
                            var args = arguments;
                            $rootScope.$apply(function () {
                                callback.apply(null, args);
                            });
                        });
                    }
                };
            }])
            .factory('initSession', ['$q', 'ws', function ($q, ws) {
                var defer = $q.defer();
                // TODO: REMOVE DOM QUERY FROM CONTROLLER!!!
                var event = {
                    templateUrl: document.URL,
                    scriptPath: config.script == "" ? $("meta[name='bms.script']").attr("content") : config.script,
                    modelPath: config.model == "" ? $("meta[name='bms.model']").attr("content") : config.model,
                    tool: $("meta[name='bms.tool']").attr("content")
                };
                ws.emit('initSession', event, function (data) {
                    defer.resolve(data.standalone)
                });
                return defer.promise;
            }]);
        /*.directive('bmsVisualisation', ['$compile', function ($compile) {
         return {
         controller: ['$scope', function ($scope) {
         $scope.values = [];
         $scope.changes = [];
         $scope.count = 0;
         $scope.mapping = [];
         $scope.order = [];
         $scope.getValue = function (bmsid, attr, defaultValue) {
         var returnValue = defaultValue === 'undefined' ? undefined : defaultValue;
         if ($scope.values !== undefined) {
         if ($scope.mapping[bmsid] !== undefined) {
         var lastIndex;
         $.each($scope.mapping[bmsid], function (i, v) {
         var index = $scope.order.indexOf(v);
         if ($scope.values[v] !== undefined && (index < lastIndex || lastIndex === undefined)) {
         lastIndex = index;
         returnValue = $scope.values[v][attr];
         }
         });
         }
         }
         return returnValue;
         };
         $scope.setValues = function (values) {
         $scope.values = values;
         };
         $scope.setOrder = function (order) {
         $scope.order = order.reverse()
         };
         }],
         link: function (scope, element) {
         scope.$watch('values', function (newValue, oldValue) {
         var changes = getChanges(scope.changes, newValue);
         $.extend(true, scope.changes, changes);
         if (changes) {
         $.each(changes, function (selector, attrs) {
         var orgElement = $(element.contents()).find(selector);
         $.each(attrs, function (attr, val) {
         orgElement.each(function () {
         var attrDefault = $(this).attr(attr);
         // Special case for class attributes
         if (attr === "class" && attrDefault === undefined) {
         attrDefault = ""
         }
         // Set internal bms id
         if (!$(this).attr("data-bms")) {
         $(this).attr("data-bms", "bms" + scope.count);
         scope.count++;
         }
         // Create mapping object, if not exists yet
         if (scope.mapping[$(this).attr("data-bms")] === undefined) {
         scope.mapping[$(this).attr("data-bms")] = [];
         }
         // Add selector to internal bms id map
         scope.mapping[$(this).attr("data-bms")].push(selector);
         // Initialise the getValue method
         $(this).attr("ng-attr-" + attr,
         "{{getValue('" + $(this).attr("data-bms") + "','" + attr + "','" + attrDefault + "')}}")
         });
         });
         });
         $compile(element.contents())(scope);
         }
         });
         }
         }
         }]);*/

    }
);
