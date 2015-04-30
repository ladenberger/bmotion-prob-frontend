/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'angular', 'bootstrap', 'jquery.cookie', 'jquery-ui', 'prob.graph', 'prob.iframe', 'prob.ui', 'prob.common'], function (angularAMD) {

    var module = angular.module('prob.online', ['prob.graph', 'prob.iframe', 'prob.ui', 'prob.common'])
        .run(['editableOptions', 'bmsMainService', function (editableOptions, bmsMainService) {
            bmsMainService.mode = 'ModeOnline';
            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
        }]);
    return angularAMD.bootstrap(module);

});