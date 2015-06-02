/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'angular', 'prob.graph', 'prob.iframe', 'prob.editor', 'prob.ui', 'prob.common'], function (angularAMD) {

    var module = angular.module('prob.online', ['prob.graph', 'prob.iframe', 'prob.editor', 'prob.ui', 'prob.common'])
        .run(['editableOptions', 'bmsMainService', function (editableOptions, bmsMainService) {
            bmsMainService.mode = 'ModeOnline';
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
        }])
        .directive('bmsApp', ['$compile', function ($compile) {
            return {
                replace: false,
                link: function ($scope, $element, attrs) {
                    angular.element(document.getElementsByTagName('body'))
                        .append($compile('<div bms-ui></div>')($scope));
                }
            }
        }]);
    return angularAMD.bootstrap(module);

});