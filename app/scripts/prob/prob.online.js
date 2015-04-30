/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'angular', 'bootstrap', 'jquery.cookie', 'jquery-ui', 'prob.graph', 'prob.iframe', 'prob.ui', 'prob.common'], function (angularAMD) {

    var module = angular.module('prob.online', ['prob.graph', 'prob.iframe', 'prob.ui', 'prob.common'])
        .run(['editableOptions', 'initProB', 'bmsMainService', '$rootScope', function (editableOptions, initProB, bmsMainService, $rootScope) {
            bmsMainService.mode = 'ModeOnline';
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
            initProB.then(function (data) {
                if (data) {
                    $rootScope.port = data.port;
                }
            });
        }]);
    return angularAMD.bootstrap(module);

});