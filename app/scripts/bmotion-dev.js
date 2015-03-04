require.config({
    baseUrl: "/bms/app/scripts",
    paths: {
        "jquery": "vendor/jquery/dist/jquery.min",
        "angular": "vendor/angular/angular.min",
        "angular-route": "vendor/angular-route/angular-route.min",
        "angularAMD": "vendor/angularAMD/angularAMD.min",
        "socketio": "vendor/socket.io-client/socket.io",
        "bootstrap": "vendor/bootstrap/dist/js/bootstrap.min",
        "jquery.cookie": "vendor/jquery.cookie/jquery.cookie",
        "tooltipster": "vendor/tooltipster/js/jquery.tooltipster.min",
        "jquery-ui": "vendor/jquery-ui/jquery-ui.min",
        "xeditable": "vendor/angular-xeditable/dist/js/xeditable.min",
        "cytoscape": "vendor/cytoscape/dist/cytoscape.min",
        "bmotion-ui": "bmotion/bmotion-ui",
        "bmotion-func": "bmotion/bmotion-func",
        "prob-ui": "prob/prob-ui",
        "prob-func": "prob/prob-func",
        "bmotion-config": "bmotion/bmotion-config"
    },
    shim: {
        "jquery-ui": ["jquery"],
        "tooltipster": ["jquery"],
        "bootstrap": ["jquery"],
        "prob-ui": ["prob-func", "bmotion-ui", "angularAMD", "jquery.cookie", "jquery-ui", "cytoscape"],
        'prob-func': ["bmotion-func", "tooltipster"],
        "bmotion-func": ["bmotion-config", "jquery", "socketio"],
        "cytoscape": {exports: "cy", deps: ["jquery"]},
        "jquery": {"exports": "$"},
        "angular": {"exports": "angular"},
        "angularAMD": ["angular"],
        "angular-route": ["angular"],
        "socketio": {"exports": "io"}
    }
});
define(['prob-ui'], function(prob) {
    return prob;
});
