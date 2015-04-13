require.config({
    baseUrl: "/bms/app/scripts",
    paths: {
        "jquery": "vendor/jquery/dist/jquery.min",
        "angular": "vendor/angular/angular.min",
        "angular-route": "vendor/angular-route/angular-route.min",
        "angularAMD": "vendor/angularAMD/angularAMD.min",
        "socketio": "vendor/socket.io-client/socket.io",
        "tooltipster": "vendor/tooltipster/js/jquery.tooltipster.min",
        "bmotion.config": "bmotion/bmotion.config",
        "bmotion.socket": "bmotion/bmotion.socket",
        "bmotion.main": "bmotion/bmotion.main",
        "bmotion.func": "bmotion/bmotion.func",
        "qtip": "vendor/qtip2/jquery.qtip",
        "prob.main": "prob/prob.main",
        "prob.graph": "prob/prob.graph",
        "prob.jquery": "prob/prob.jquery",
        "prob.observers": "prob/prob.observers",
        "prob.api": "prob/prob.api",
        "prob.vis": "prob/prob.vis"
    },
    shim: {
        "angular": {"exports": "angular"},
        "angularAMD": ["angular"],
        "angular-route": ["angular"],
        "socketio": {"exports": "io"},
        "jquery": {"exports": "$"},
        "tooltipster": ["jquery"],
        "qtip": ["jquery"],
        "prob.api": {
            exports: "bmotion"
        }
    }
});
define(['prob.vis'], function () {
});
