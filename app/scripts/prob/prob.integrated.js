/**
 * BMotion Studio for ProB Integrated Module
 *
 */
define(['angularAMD', 'angular', 'prob.graph', 'prob.iframe', 'bms.common'], function (angularAMD) {

    var module = angular.module('prob.integrated', ['bms.common', 'prob.graph', 'prob.iframe'])
        .run(['bmsMainService', function (bmsMainService) {
            bmsMainService.mode = 'ModeIntegrated';
        }]);
    return angularAMD.bootstrap(module);

});