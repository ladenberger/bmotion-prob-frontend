/**
 * BMotion Studio for ProB API Module
 *
 */
define(['bmotion.func', 'jquery'], function (bms) {
    var bmotion = window.bmotion || (window.bmotion = {});
    return $.extend(bmotion, bms);
});
