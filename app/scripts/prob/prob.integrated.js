/**
 * BMotion Studio for ProB Integrated Module
 *
 */
define(['angularAMD', 'angular', 'prob.graph', 'prob.iframe'], function (angularAMD) {

    var module = angular.module('prob.integrated', ['prob.graph', 'prob.iframe']);
    return angularAMD.bootstrap(module);

});