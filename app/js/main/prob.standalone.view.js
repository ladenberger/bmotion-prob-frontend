/**
 * BMotion Studio for ProB UI Module
 *
 */
define(['angular-route'], function () {

    var module = angular.module('prob.standalone.view', ['ngRoute'])
        .controller('bmsVisualizationCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {
            var self = this;
            self.view = $routeParams.view;
            self.sessionId = $routeParams.sessionId;
        }]);

    return module;

});