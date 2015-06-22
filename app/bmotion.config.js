requirejs.config({
    baseUrl: "../app/js/",
    paths: {

        // Common modules
        "bms.common": "bms.common",
        "bms.func": "bms.func",
        "bms.socket": "bms.socket",
        "bms.config": "bms.config",
        "bms.visualization": "bms.visualization",

        "prob.ui": "prob.ui",
        "prob.common": "prob.common",
        "prob.modal": "prob.modal",
        "prob.graph": "prob.graph",
        "prob.jquery": "prob.jquery",
        "prob.observers": "prob.observers",

        // IFrame directive modules
        "prob.iframe.editor": "prob.iframe.editor",
        "prob.iframe.template": "prob.iframe.template",
        "prob.template": "prob.template",
        "prob.editor": "prob.editor",

        // Mode modules
        "prob.online": "prob.online",
        "prob.integrated": "prob.integrated",
        "prob.standalone": "prob.standalone",

        // Third party modules
        "jquery": "libs/bower/jquery/jquery",
        "socketio": "libs/bower/socket.io-client/socket.io",
        "angular": "libs/bower/angular/angular",
        "angular-route": "libs/bower/angular-route/angular-route",

        "ui-bootstrap": "libs/bower/angular-bootstrap/ui-bootstrap",
        "ui-bootstrap-tpls": "libs/bower/angular-bootstrap/ui-bootstrap-tpls",
        "angularAMD": "libs/bower/angularAMD/angularAMD",

        "jquery-ui": "libs/ext/jquery-ui/jquery-ui",

        //"jquery.cookie": "libs/bower/jquery.cookie/jquery.cookie",
        "qtip": "libs/bower/qtip2/jquery.qtip",
        "tv4": "libs/bower/tv4/tv4",
        "angular-xeditable": "libs/bower/angular-xeditable/xeditable",
        "cytoscape": "libs/bower/cytoscape/cytoscape",
        "cytoscape.navigator": "libs/ext/cytoscape.navigator/cytoscape.js-navigator"

        /*"jquery.contextMenu": "libs/ext/contextmenu/jquery.contextMenu",
         "jquery.jgraduate": "libs/ext/jgraduate/jquery.jgraduate.min",
         "jpicker": "libs/ext/jgraduate/jpicker.min",
         "jquery.svgicons": "libs/ext/jquery.svgicons",
         "jquery.bbq": "libs/ext/jquerybbq/jquery.bbq.min",
         "jquery.browser": "libs/bower/jquery.browser/jquery.browser",
         "jquery.hotkeys": "libs/ext/js-hotkeys/jquery.hotkeys.min",
         "jquery.draginput": "libs/ext/jquery-draginput",
         "mousewheel": "libs/ext/mousewheel",
         "taphold": "libs/ext/taphold",
         "touch": "libs/ext/touch",
         "requestanimationframe": "libs/ext/requestanimationframe",
         "browser": "editor/src/browser",
         "contextmenu": "editor/src/contextmenu",
         "dialog": "editor/src/dialog",
         "draw": "editor/src/draw",
         "history": "editor/src/history",
         "math": "editor/src/math",
         "method-draw": "editor/src/method-draw",
         "path": "editor/src/path",
         "sanitize": "editor/src/sanitize",
         "select": "editor/src/select",
         "svgcanvas": "editor/src/svgcanvas",
         "svgtransformlist": "editor/src/svgtransformlist",
         "svgutils": "editor/src/svgutils",
         "units": "editor/src/units"*/
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
        "angular-route": ["angular"]
        /*"jpicker": ["jquery.jgraduate"],
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
         ]*/
    }
});