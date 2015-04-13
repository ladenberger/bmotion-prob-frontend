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
        "cytoscape": "vendor/cytoscape/dist/cytoscape",
        "cytoscape.navigator": "vendor/cytoscape.js-navigator/cytoscape.js-navigator",
        "bmotion.config": "bmotion/bmotion.config",
        "bmotion.socket": "bmotion/bmotion.socket",
        "bmotion.main": "bmotion/bmotion.main",
        "bmotion.func": "bmotion/bmotion.func",
        "prob.main": "prob/prob.main",
        "prob.standalone": "prob/prob.standalone",
        "prob.graph": "prob/prob.graph",
        "prob.jquery": "prob/prob.jquery",
        "prob.observers": "prob/prob.observers",
        "prob.api": "prob/prob.api",
        "qtip": "vendor/qtip2/jquery.qtip"
        /*,"geometry": "vendor/joint/src/geometry",
         "vectorizer": "vendor/joint/src/vectorizer",
         "lodash": "vendor/lodash/lodash",
         "backbone": "vendor/joint/lib/backbone",
         "joint": "vendor/joint/dist/joint.clean",
         "joint.layout.DirectedGraph": "vendor/joint/plugins/layout/DirectedGraph/joint.layout.DirectedGraph",
         "dagre": "vendor/joint/plugins/layout/DirectedGraph/lib/dagre"*/
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
        "qtip": ["jquery"],
        "cytoscape": {
            exports: "cy",
            deps: ["jquery"]
        },
        "cytoscape.navigator": ["cytoscape"],
        /*backbone: {
         //These script dependencies should be loaded before loading backbone.js.
         deps: ['lodash', 'jquery'],
         //Once loaded, use the global 'Backbone' as the module value.
         exports: 'Backbone'
         },
         "joint.layout.DirectedGraph": ["joint", "dagre"],
         joint: {
         deps: ['geometry', 'vectorizer', 'jquery', 'lodash', 'backbone'],
         exports: 'joint',
         init: function(geometry, vectorizer) {
         // JointJS must export geometry and vectorizer otheriwse
         // they won't be exported due to the AMD nature of those libs and
         // so JointJS would be missing them.
         this.g = geometry;
         this.V = vectorizer;
         }
         },
         lodash: {
         exports: '_'
         },*/
        "prob.api": {
            exports: "bmotion"
        },
        "prob.graph": ['prob.api', 'angular', 'jquery', 'xeditable', 'cytoscape']
    },
    map: {
        "*": {
            "underscore": "lodash"
        }
    }
});
define(['prob.standalone'], function (prob) {
    return prob;
});
