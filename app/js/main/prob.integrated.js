/**
 * BMotion Studio for ProB Integrated Module
 *
 */
define(['angularAMD', 'angular', 'prob.graph', 'prob.iframe.template', 'bms.observers'], function (angularAMD) {

    var module = angular.module('prob.integrated', ['prob.graph', 'prob.iframe.template', 'bms.observers'])
        .run(['bmsMainService', function (bmsMainService) {
            bmsMainService.mode = 'ModeIntegrated';
        }]);
    return angularAMD.bootstrap(module);

});
