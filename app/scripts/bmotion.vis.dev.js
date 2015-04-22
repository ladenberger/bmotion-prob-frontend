requirejs.config({
    baseUrl: "../../../app/scripts",
    paths: {
        "jquery": "vendor/jquery/dist/jquery.min",
        "angular": "vendor/angular/angular.min",
        "angularAMD": "vendor/angularAMD/angularAMD.min",
        "bmotion.func": "bmotion/bmotion.func",
        "prob.jquery": "prob/prob.jquery",
        "prob.api": "prob/prob.api",
        "prob.vis": "prob/prob.vis"
    },
    shim: {
        "angular": {"exports": "angular"},
        "angularAMD": ["angular"],
        "jquery": {"exports": "$"},
        "prob.vis": ["prob.jquery"],
        "prob.api": {
            exports: "bmotion"
        }
    }
});
define(['prob.vis'], function () {
});
