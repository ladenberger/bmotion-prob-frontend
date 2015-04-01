({
    baseUrl: "../scripts",
    name: "bmotion",
    out: "../../dist/bmotion.js",
    //optimize: "closure",
    removeCombined: true,
    findNestedDependencies: true,
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
        "cytoscape.navigator": "vendor/cytoscape.js-navigator/cytoscape.js-navigator",
        "bmotion.config": "bmotion/bmotion.config",
        "bmotion.socket": "bmotion/bmotion.socket",
        "bmotion.main": "bmotion/bmotion.main",
        "bmotion.func": "bmotion/bmotion.func",
        "prob.main": "prob/prob.main",
        "prob.standalone": "prob/prob.standalone",
        "prob.graph": "prob/prob.graph",
        "prob.observers": "prob/prob.observers",
        "prob.func": "prob/prob.func",
        "prob.api": "prob/prob.api"
    },
    shim: {
        "angular": {"exports": "angular"},
        "angularAMD": ["angular"],
        "angular-route": ["angular"],
        "socketio": {"exports": "io"},
        "xeditable": ["angular"],
        "jquery": {"exports": "$"},
        "jquery-ui": ["jquery"],
        "bootstrap": ["jquery"],
        "tooltipster": ["jquery"],
        "cytoscape": {
            exports: "cy",
            deps: ["jquery"]
        },
        "cytoscape.navigator": ["cytoscape"],
        "prob.api": {
            exports: "bmotion"
        }
    }
});
