/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'angular', 'prob.graph', 'prob.iframe', 'prob.ui'], function (angularAMD) {

    var module = angular.module('prob.standalone', ['prob.graph', 'prob.iframe', 'prob.ui']);
    return angularAMD.bootstrap(module);

});