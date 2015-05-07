requirejs(['../../app/scripts/bmotion.vis.dev'], function () {

    $("#phils").observe("csp-event", {
        observers: [
            {
                "exp": "{thinks.x | x <- {0..4}}",
                "actions": [
                    {
                        "selector": "#phil{{a1}}h",
                        "attr": "fill",
                        "value": "green"
                    }
                ]
            },
            {
                "exp": "{eats.x | x <- {0..4}}",
                "actions": [
                    {
                        "selector": "#phil{{a1}}ts",
                        "attr": "fill",
                        "value": "green"
                    }
                ]
            },
            {
                "exp": "{sits.x | x <- {0..4}}",
                "actions": [
                    {
                        "selector": "#phil{{a1}}",
                        "attr": "class",
                        "value": "hidden"
                    },
                    {
                        "selector": "#phil{{a1}}t",
                        "attr": "class",
                        "value": "visible"
                    }
                ]
            },
            {
                "exp": "{getsup.x | x <- {0..4}}",
                "actions": [
                    {
                        "selector": "#phil{{a1}}",
                        "attr": "class",
                        "value": "visible"
                    },
                    {
                        "selector": "#phil{{a1}}t",
                        "attr": "class",
                        "value": "hidden"
                    }
                ]
            },
            {
                "exp": "{putsdown.p.f | p <- {0..4}, f <- {0..4}}",
                "actions": [
                    {
                        "selector": "#fork{{a2}}",
                        "attr": "class",
                        "value": "visible"
                    },
                    {
                        "selector": "#fork{{a1}}{{a2}}",
                        "attr": "class",
                        "value": "hidden"
                    },
                    {
                        "selector": "#phil{{a1}}ts",
                        "attr": "fill",
                        "value": "black"
                    }
                ]
            },
            {
                "exp": "{picks.p.f | p <- {0..4}, f <- {0..4}}",
                "actions": [
                    {
                        "selector": "#fork{{a1}}{{a2}}",
                        "attr": "class",
                        "value": "visible"
                    },
                    {
                        "selector": "#fork{{a2}}",
                        "attr": "class",
                        "value": "hidden"
                    }
                ]
            }
        ]
    });

});
