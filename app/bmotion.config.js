requirejs.config({
    baseUrl: "./",
    paths: {

        // Root modules
        "bmotion.editor": "js/bmotion.editor",
        "bmotion.online": "js/bmotion.online",
        "bmotion.standalone": "js/bmotion.standalone",
        "bmotion.integrated": "js/bmotion.integrated",
        "bmotion.template": "js/bmotion.template",

        // Mode modules
        "prob.online": "js/main/prob.online",
        "prob.integrated": "js/main/prob.integrated",
        "prob.standalone": "js/main/prob.standalone",
        "prob.standalone.view": "js/main/prob.standalone.view",
        "prob.standalone.menu": "js/main/prob.standalone.menu",

        // Common modules
        "bms.common": "js/main/bms.common",
        "bms.session": "js/main/bms.session",
        "bms.func": "js/main/bms.func",
        "bms.socket": "js/main/bms.socket",
        "bms.config": "js/main/bms.config",
        "bms.visualization": "js/main/bms.visualization",
        "bms.manifest": "js/main/bms.manifest",
        "bms.nwjs": "js/main/bms.nwjs",
        "bms.electron": "js/main/bms.electron",

        "prob.ui": "js/main/prob.ui",
        "prob.common": "js/main/prob.common",
        "prob.modal": "js/main/prob.modal",
        "prob.graph": "js/main/prob.graph",
        "prob.observers": "js/main/prob.observers",

        // IFrame directive modules
        "prob.iframe.template": "js/main/prob.iframe.template",
        "prob.template": "js/main/prob.template",

        // Third party modules
        "jquery": "js/libs/bower/jquery/jquery",
        "socketio": "js/libs/bower/socket.io-client/socket.io",
        "angular": "js/libs/bower/angular/angular",
        "angular-route": "js/libs/bower/angular-route/angular-route",
        "angular-sanitize": "js/libs/bower/angular-sanitize/angular-sanitize",
        "ui-bootstrap": "js/libs/bower/angular-bootstrap/ui-bootstrap",
        "ui-bootstrap-tpls": "js/libs/bower/angular-bootstrap/ui-bootstrap-tpls",
        "angularAMD": "js/libs/bower/angularAMD/angularAMD",
        "jquery-ui": "js/libs/ext/jquery-ui/jquery-ui",

        "qtip": "js/libs/bower/qtip2/jquery.qtip",
        "tv4": "js/libs/bower/tv4/tv4",
        "cytoscape": "js/libs/bower/cytoscape/cytoscape",
        "cytoscape.navigator": "js/libs/ext/cytoscape.navigator/cytoscape.js-navigator",

        // Editor dependencies
        "angular-xeditable": "editor/js/libs/bower/angular-xeditable/xeditable",
        "prob.iframe.editor": "editor/js/prob.iframe.editor",
        "prob.editor": "editor/js/prob.editor",
        "codemirror-javascript": "editor/js/libs/bower/codemirror/mode/javascript/javascript",
        "angular-ui-codemirror": "editor/js/libs/bower/angular-ui-codemirror/ui-codemirror",
        "code-mirror": "editor/js/libs/ext/requirejs-codemirror/code-mirror",
        "jquery.contextMenu": "editor/js/libs/ext/contextmenu/jquery.contextMenu",
        "jquery.jgraduate": "editor/js/libs/ext/jgraduate/jquery.jgraduate.min",
        "jpicker": "editor/js/libs/ext/jgraduate/jpicker.min",
        "jquery.svgicons": "editor/js/libs/ext/jquery.svgicons",
        "jquery.bbq": "editor/js/libs/ext/jquerybbq/jquery.ba-bbq",
        "jquery.browser": "editor/js/libs/bower/jquery.browser/jquery.browser",
        "jquery.hotkeys": "editor/js/libs/ext/js-hotkeys/jquery.hotkeys.min",
        "jquery.draginput": "editor/js/libs/ext/jquery-draginput",
        "mousewheel": "editor/js/libs/ext/mousewheel",
        "taphold": "editor/js/libs/ext/taphold",
        "touch": "editor/js/libs/ext/touch",
        "requestanimationframe": "editor/js/libs/ext/requestanimationframe",
        "browser": "editor/js/browser",
        "contextmenu": "editor/js/contextmenu",
        "dialog": "editor/js/dialog",
        "draw": "editor/js/draw",
        "history": "editor/js/history",
        "math": "editor/js/math",
        "method-draw": "editor/js/method-draw",
        "path": "editor/js/path",
        "sanitize": "editor/js/sanitize",
        "select": "editor/js/select",
        "svgcanvas": "editor/js/svgcanvas",
        "svgtransformlist": "editor/js/svgtransformlist",
        "svgutils": "editor/js/svgutils",
        "units": "editor/js/units"
    },
    shim: {
        "socketio": {"exports": "io"},
        "jquery": {"exports": "$"},
        "angular": {"exports": "angular"},
        "angularAMD": ["angular"],
        "ui-bootstrap": ["angular"],
        "ui-bootstrap-tpls": ["ui-bootstrap"],
        "angular-sanitize": ["angular"],
        "angular-xeditable": ["angular"],
        "angular-ui-codemirror": ["angular", "code-mirror"],
        "qtip": ["jquery"],
        "cytoscape": {
            exports: "cy",
            deps: ["jquery"]
        },
        "cytoscape.navigator": ['cytoscape', 'jquery'],
        "jquery-ui": ["jquery"],
        "angular-route": ["angular"],
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
            "jquery", "touch", "jquery.hotkeys", "jquery.bbq",
            "jquery.svgicons", "jquery.contextMenu",
            "browser", "svgtransformlist", "math",
            "units", "svgutils", "sanitize", "history",
            "select", "draw", "path", "dialog", "svgcanvas",
            "jquery.browser"
        ]
    },
    cm: {
        // baseUrl to CodeMirror dir
        baseUrl: './',
        // path to CodeMirror lib
        path: 'editor/js/libs/bower/codemirror/lib/codemirror',
        // path to CodeMirror css file
        css: 'css/libs/bower/codemirror/codemirror.css',
        // define themes
        themes: {},
        modes: {
            // modes dir structure
            path: 'editor/js/libs/bower/codemirror/mode/{mode}/{mode}'
        }
    }
});
