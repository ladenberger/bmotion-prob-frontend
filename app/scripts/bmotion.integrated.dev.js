requirejs.config({
    baseUrl: "../../../app/scripts",
    paths: {
        "jquery": "vendor/jquery/dist/jquery.min",
        "angular": "vendor/angular/angular.min",
        "angular-route": "vendor/angular-route/angular-route.min",
        "angularAMD": "vendor/angularAMD/angularAMD.min",
        "socketio": "vendor/socket.io-client/socket.io",
        "xeditable": "vendor/angular-xeditable/dist/js/xeditable.min",
        "cytoscape": "vendor/cytoscape/dist/cytoscape",
        "cytoscape.navigator": "vendor/cytoscape.js-navigator/cytoscape.js-navigator",
        "bms.common": "bmotion/bms.common",
        "bmotion.func": "bmotion/bmotion.func",
        "prob.iframe": "prob/prob.iframe",
        "prob.integrated": "prob/prob.integrated",
        "prob.graph": "prob/prob.graph",
        "prob.jquery": "prob/prob.jquery",
        "prob.observers": "prob/prob.observers",
        "prob.api": "prob/prob.api",
        "qtip": "vendor/qtip2/jquery.qtip"
    },
    shim: {
        "angular": {"exports": "angular"},
        "angularAMD": ["angular"],
        "angular-route": ["angular"],
        "socketio": {"exports": "io"},
        "jquery": {"exports": "$"},
        "xeditable": ["angular"],
        "qtip": ["jquery"],
        "cytoscape": {
            exports: "cy",
            deps: ["jquery"]
        },
        "cytoscape.navigator": ["cytoscape"],
        "prob.integrated": ['prob.graph', 'prob.iframe'],
        "prob.graph": ['prob.api', 'angular', 'jquery', 'xeditable', 'cytoscape', 'cytoscape.navigator'],
        "prob.api": {
            exports: "bmotion"
        }
    }
});
define(['prob.integrated'], function (prob) {
    return prob;
});
