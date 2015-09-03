/**
 * BMotion Studio for ProB UI Module
 *
 */
define(['bms.nwjs'], function () {

    var module = angular.module('prob.standalone.view', ['bms.nwjs'])
        .controller('bmsVisualizationCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {
            var self = this;
            self.view = $routeParams.view;
            self.sessionId = $routeParams.sessionId;
        }])
        .controller('bmsStandaloneViewCtrl', ['$scope', 'Menu', function ($scope, Menu) {

            $scope.$on('visualizationLoaded', function () {
                angular.forEach(Menu.probMenu.items, function (i) {
                    i.enabled = true;
                });
                angular.forEach(Menu.diagramMenu.items, function (i) {
                    i.enabled = true;
                });
            });

        }]);

    return module;

});