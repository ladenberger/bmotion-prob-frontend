define(['bmotion.func', 'prob.func'], function (bms, prob) {
    var bmotion = window.bmotion || (window.bmotion = {});
    return $.extend(bmotion, bms, prob);
});
