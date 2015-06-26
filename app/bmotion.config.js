requirejs.config({
    baseUrl: "./",
    paths: {

        // Common modules
        "bms.common": "js/bms.common",
        "bms.func": "js/bms.func",
        "bms.socket": "js/bms.socket",
        "bms.config": "js/bms.config",
        "bms.visualization": "js/bms.visualization",

        "bmotion.editor": "js/bmotion.editor",
        "bmotion.online": "js/bmotion.online",
        "bmotion.standalone": "js/bmotion.standalone",
        "bmotion.integrated": "js/bmotion.integrated",
        "bmotion.template": "js/bmotion.template",

        "prob.ui": "js/prob.ui",
        "prob.common": "js/prob.common",
        "prob.modal": "js/prob.modal",
        "prob.graph": "js/prob.graph",
        "prob.jquery": "js/prob.jquery",
        "prob.observers": "js/prob.observers",

        // IFrame directive modules
        "prob.iframe.editor": "js/prob.iframe.editor",
        "prob.iframe.template": "js/prob.iframe.template",
        "prob.template": "js/prob.template",
        "prob.editor": "js/prob.editor",

        // Mode modules
        "prob.online": "js/prob.online",
        "prob.integrated": "js/prob.integrated",
        "prob.standalone": "js/prob.standalone",

        // Third party modules
        "jquery": "js/libs/bower/jquery/jquery",
        "socketio": "js/libs/bower/socket.io-client/socket.io",
        "angular": "js/libs/bower/angular/angular",
        "angular-route": "js/libs/bower/angular-route/angular-route",
        "angular-json-editor": "js/libs/bower/angular-json-editor/angular-json-editor",
        "json-editor": "js/libs/bower/json-editor/jsoneditor",

        "ui-bootstrap": "js/libs/bower/angular-bootstrap/ui-bootstrap",
        "ui-bootstrap-tpls": "js/libs/bower/angular-bootstrap/ui-bootstrap-tpls",
        "angularAMD": "js/libs/bower/angularAMD/angularAMD",

        "jquery-ui": "js/libs/ext/jquery-ui/jquery-ui",

        //"jquery.cookie": "libs/bower/jquery.cookie/jquery.cookie",
        "qtip": "js/libs/bower/qtip2/jquery.qtip",
        "tv4": "js/libs/bower/tv4/tv4",
        "angular-xeditable": "js/libs/bower/angular-xeditable/xeditable",
        "cytoscape": "js/libs/bower/cytoscape/cytoscape",
        "cytoscape.navigator": "js/libs/ext/cytoscape.navigator/cytoscape.js-navigator",

        // Editor dependencies
        "jquery.contextMenu": "js/libs/ext/contextmenu/jquery.contextMenu",
        "jquery.jgraduate": "js/libs/ext/jgraduate/jquery.jgraduate.min",
        "jpicker": "js/libs/ext/jgraduate/jpicker.min",
        "jquery.svgicons": "js/libs/ext/jquery.svgicons",
        "jquery.bbq": "js/libs/ext/jquerybbq/jquery.bbq.min",
        "jquery.browser": "js/libs/bower/jquery.browser/jquery.browser",
        "jquery.hotkeys": "js/libs/ext/js-hotkeys/jquery.hotkeys.min",
        "jquery.draginput": "js/libs/ext/jquery-draginput",
        "mousewheel": "js/libs/ext/mousewheel",
        "taphold": "js/libs/ext/taphold",
        "touch": "js/libs/ext/touch",
        "requestanimationframe": "js/libs/ext/requestanimationframe",
        "browser": "js/editor/browser",
        "contextmenu": "js/editor/contextmenu",
        "dialog": "js/editor/dialog",
        "draw": "js/editor/draw",
        "history": "js/editor/history",
        "math": "js/editor/math",
        "method-draw": "js/editor/method-draw",
        "path": "js/editor/path",
        "sanitize": "js/editor/sanitize",
        "select": "js/editor/select",
        "svgcanvas": "js/editor/svgcanvas",
        "svgtransformlist": "js/editor/svgtransformlist",
        "svgutils": "js/editor/svgutils",
        "units": "js/editor/units"
    },
    shim: {
        "prob.jquery": ['bms.func', 'jquery'],
        "socketio": {"exports": "io"},
        "jquery": {"exports": "$"},
        "angular": {"exports": "angular"},
        "angularAMD": ["angular"],
        "ui-bootstrap": ["angular"],
        "ui-bootstrap-tpls": ["ui-bootstrap"],
        "angular-xeditable": ["angular"],
        "qtip": ["jquery"],
        "cytoscape": {
            exports: "cy",
            deps: ["jquery"]
        },
        "cytoscape.navigator": ['cytoscape'],
        "jquery-ui": ["jquery"],
        "angular-route": ["angular"],
        "angular-json-editor": ["json-editor"],
        "jpicker": ["jquery.jgraduate"],
        "jquery.jgraduate": ["jquery"],
        "jquery.contextMenu": ["jquery"],
        "jquery.bbq": ["jquery", "jquery.browser"],
        "jquery.hotkeys": ["jquery"],
        "jquery.draginput": ["jquery"],
        "jquery.svgicons": ["jquery"],
        "taphold": ["jquery"],
        "mousewheel": ["jquery"],
        "contextmenu": ["jquery", "method-draw"],
        "sanitize": ["jquery"],
        "svgcanvas": ["jquery"],
        "units": ["jquery"],
        "dialog": ["jquery", "jquery-ui"],
        "svgutils": ["browser"],
        "method-draw": [
            "jquery", "jquery.bbq", "jquery.svgicons",
            "units", "math", "svgutils", "sanitize",
            "history", "select", "draw", "path", "dialog",
            "jquery.contextMenu", "svgcanvas", "browser"
        ]
    }
});
