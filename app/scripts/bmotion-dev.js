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
        "bmotion.config": "bmotion/bmotion.config",
        "bmotion.socket": "bmotion/bmotion.socket",
        "bmotion.main": "bmotion/bmotion.main",
        "bmotion.func": "bmotion/bmotion.func",
        "prob.main": "prob/prob.main",
        "prob.standalone": "prob/prob.standalone",
        "prob.graph":  "prob/prob.graph",
        "prob.func": "prob/prob.func",
        "prob.observers": "prob/prob.observers",
        "prob.api": "prob/prob.api"
    },
    shim: {
        "angular": {"exports": "angular"},
        "angularAMD": ["angular"],
        "angular-route": ["angular"],
        "socketio": {"exports": "io"},
        "jquery": {"exports": "$"},
        "jquery-ui": ["jquery"],
        "bootstrap": ["jquery"],
        "xeditable": ["angular"],
        "tooltipster": ["jquery"],
        "cytoscape": {
            exports: "cy",
            deps: ["jquery"]
        },
        "prob.api": {
            exports: "bmotion"
        },
        "prob.graph": ['prob.api', 'angular', 'jquery', 'xeditable', 'cytoscape']
    }
});
define(['prob.standalone'], function(prob) {
    return prob;
});
