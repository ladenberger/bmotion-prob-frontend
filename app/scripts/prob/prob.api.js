define(['bmotion.func', 'prob.jquery'], function (bms, prob) {
    var bmotion = window.bmotion || (window.bmotion = {});
    return $.extend(bmotion, bms, prob);
});
