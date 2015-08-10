/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'angular', 'prob.graph', 'prob.iframe.template', 'prob.ui', 'angular-route'], function (angularAMD) {

    var module = angular.module('prob.online', ['prob.graph', 'prob.iframe.template', 'prob.ui', 'ngRoute'])
        .config(['$routeProvider', '$locationProvider', function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'resources/templates/bms-online-ui.html',
                    controller: 'readyController'
                }).
                otherwise({
                    redirectTo: '/'
                });
        }])
        .controller('readyController', ['$scope', function ($scope) {
        }])
        .run(['editableOptions', 'bmsMainService', function (editableOptions, bmsMainService) {
            bmsMainService.mode = 'ModeOnline';
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
        }]);
    return angularAMD.bootstrap(module);

})
;