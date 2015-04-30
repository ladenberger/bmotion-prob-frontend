requirejs.config({
    baseUrl: "../../app/scripts",
    paths: {
        "jquery": "vendor/jquery/dist/jquery.min",
        "angular": "vendor/angular/angular.min",
        "angular-route": "vendor/angular-route/angular-route.min",
        "ui-bootstrap": "vendor/angular-bootstrap/ui-bootstrap",
        "ui-bootstrap-tpls": "vendor/angular-bootstrap/ui-bootstrap-tpls",
        "angularAMD": "vendor/angularAMD/angularAMD.min",
        "socketio": "vendor/socket.io-client/socket.io",
        "bootstrap": "vendor/bootstrap/dist/js/bootstrap.min",
        "jquery.cookie": "vendor/jquery.cookie/jquery.cookie",
        "jquery-ui": "vendor/jquery-ui/jquery-ui.min",
        "xeditable": "vendor/angular-xeditable/dist/js/xeditable.min",
        "cytoscape": "vendor/cytoscape/dist/cytoscape",
        "cytoscape.navigator": "vendor/cytoscape.js-navigator/cytoscape.js-navigator",
        "bms.common": "bmotion/bms.common",
        "bmotion.func": "bmotion/bmotion.func",
        "prob.ui": "prob/prob.ui",
        "prob.iframe": "prob/prob.iframe",
        "prob.standalone": "prob/prob.standalone",
        "prob.common": "prob/prob.common",
        "prob.modal": "prob/prob.modal",
        "prob.graph": "prob/prob.graph",
        "prob.jquery": "prob/prob.jquery",
        "prob.observers": "prob/prob.observers",
        "prob.online": "prob/prob.online",
        "prob.api": "prob/prob.api",
        "qtip": "vendor/qtip2/jquery.qtip"
    },
    shim: {
        "angular": {"exports": "angular"},
        "angularAMD": ["angular"],
        "angular-route": ["angular"],
        "ui-bootstrap-tpls": ["ui-bootstrap"],
        "ui-bootstrap": ["angular"],
        "socketio": {"exports": "io"},
        "jquery": {"exports": "$"},
        "jquery-ui": ["jquery"],
        "bootstrap": ["jquery"],
        "xeditable": ["angular"],
        "qtip": ["jquery"],
        "cytoscape": {
            exports: "cy",
            deps: ["jquery"]
        },
        "cytoscape.navigator": ["cytoscape"],
        "prob.online": ['prob.graph', 'prob.ui', 'prob.iframe', 'prob.jquery', 'prob.modal'],
        "prob.iframe": ['prob.modal'],
        "prob.graph": ['prob.api', 'prob.modal', 'angular', 'jquery', 'xeditable', 'cytoscape', 'cytoscape.navigator'],
        "prob.api": {
            exports: "bmotion"
        }
    }
});
define(['prob.online'], function (prob) {
    return prob;
});
