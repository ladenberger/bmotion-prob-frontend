requirejs(['../../app/scripts/bmotion.vis.dev'], function () {

    requirejs(['joint-wrapper.js'], function () {

        var dd = false;

        $("#bully").observe("formula", {
            formulas: ["N"],
            trigger: function (origin, r) {

                if (!dd) {

                    var nodes = parseInt(r[0]);

                    var graph = new joint.dia.Graph;

                    var paperWidth = 600;
                    var paperHeight = 500;

                    var paper = new joint.dia.Paper({
                        el: $('#bully'),
                        width: paperWidth,
                        height: paperHeight + 50,
                        model: graph,
                        gridSize: 1,
                        interactive: false
                    });

                    // Calculate circle layout --------------
                    /* Radius. */
                    var r = Math.min(paperWidth, paperHeight) / 2;
                    /* Where to start the circle. */
                    var dx = paperWidth / 2;
                    var dy = paperHeight / 2;
                    /* Calculate the step so that the vertices are equally apart. */
                    var step = 2 * Math.PI / nodes;
                    var t = 0; // Start at "angle" 0.
                    // --------------------------------------

                    for (var i = 0; i < nodes; i++) {

                        var x = Math.round(r * Math.cos(t) + dx);
                        var y = Math.round(r * Math.sin(t) + dy);
                        t = t + step;

                        var rect = new joint.shapes.basic.Circle({
                            position: {x: x, y: y},
                            size: {width: 50, height: 50},
                            attrs: {
                                circle: {fill: 'lightblue', 'data-o-id': i},
                                text: {text: i, fill: 'black'}
                            }
                        });
                        graph.addCell(rect);

                    }

                    angular.forEach(graph.getElements(), function (source) {
                        angular.forEach(graph.getElements(), function (target) {
                            var sourceId = source.attr('circle/data-o-id');
                            var targetId = target.attr('circle/data-o-id');
                            if (sourceId !== targetId) {
                                var link = new joint.dia.Link({
                                    source: {id: source.id},
                                    target: {id: target.id}
                                });
                                link.attr({
                                    '.': {'data-o-id': sourceId + '-' + targetId},
                                    '.connection': {stroke: 'black', 'data-o-id': sourceId + '-' + targetId},
                                    '.marker-target': {fill: 'black', d: 'M 10 0 L 0 5 L 10 10 z'}
                                });
                                graph.addCell(link);
                            }
                        });
                    });

                    $(".element").executeEvent({
                        events: [
                            {
                                name: function (origin) {
                                    return "fail." + origin.attr('data-o-id');
                                }
                            },
                            {
                                name: function (origin) {
                                    return "revive." + origin.attr('data-o-id');
                                }
                            }
                        ]
                    });

                }

                dd = true;

            }
        });

        $("#bully").observe("csp-event", {
            observers: [
                {
                    events: ["Network"],
                    exp: "Events",
                    actions: [
                        {
                            selector: ".link",
                            attr: "class",
                            value: "link hidden"
                        }
                    ]
                },
                {
                    exp: "{election.x.y, test.x.y | x <- {0..N-1}, y <- {0..N-1}}",
                    actions: [
                        {
                            "selector": "g[data-o-id={{a1}}-{{a2}}]",
                            attr: "class",
                            value: "link visible"
                        }
                    ]
                },
                {
                    exp: "{ok.x.y, answer.x.y, coordinator.x.y | x <- {0..N-1}, y <- {0..N-1}}",
                    actions: [
                        {
                            "selector": "g[data-o-id={{a1}}-{{a2}}]",
                            attr: "class",
                            value: "link visible"
                        }
                    ]
                },
                {
                    exp: "{test.x.y | x <- {0..N-1}, y <- {0..N-1}}",
                    actions: [
                        {
                            selector: "path[data-o-id={{a1}}-{{a2}}]",
                            attr: "stroke",
                            value: "cyan"
                        }
                    ]
                },
                {
                    "exp": "{ok.x.y | x <- {0..N-1}, y <- {0..N-1}}",
                    "actions": [
                        {
                            selector: "path[data-o-id={{a2}}-{{a1}}]",
                            "attr": "stroke",
                            "value": "green"
                        }
                    ]
                },
                {
                    "exp": "{election.x.y | x <- {0..N-1}, y <- {0..N-1}}",
                    "actions": [
                        {
                            "selector": "path[data-o-id={{a1}}-{{a2}}]",
                            "attr": "stroke",
                            "value": "blue"
                        }
                    ]
                },
                {
                    "exp": "{answer.x.y | x <- {0..N-1}, y <- {0..N-1}}",
                    "actions": [
                        {
                            "selector": "path[data-o-id={{a2}}-{{a1}}]",
                            "attr": "stroke",
                            "value": "orange"
                        }
                    ]
                },
                {
                    "exp": "{coordinator.x.y | x <- {0..N-1}, y <- {0..N-1}}",
                    "actions": [
                        {
                            "selector": "path[data-o-id={{a2}}-{{a1}}]",
                            "attr": "stroke",
                            "value": "purple"
                        },
                        {
                            "selector": "circle[data-o-id={{a1}}]",
                            "attr": "fill",
                            "value": "purple"
                        }
                    ]
                },
                {
                    "exp": "{fail.x | x <- {0..N-1}}",
                    "actions": [
                        {
                            "selector": "circle[data-o-id={{a1}}]",
                            "attr": "fill",
                            "value": "lightgray"
                        }
                    ]
                },
                {
                    "exp": "{revive.x | x <- {0..N-1}}",
                    "actions": [
                        {
                            "selector": "circle[data-o-id={{a1}}]",
                            "attr": "fill",
                            "value": "white"
                        }
                    ]
                },
                {
                    "exp": "{leader.x.y | x <- {0..N-1}, y <- {0..N-1}, x < y}",
                    "actions": [
                        {
                            "selector": "circle[data-o-id={{a1}}]",
                            "attr": "fill",
                            "value": "lightblue"
                        }
                    ]
                }
            ]
        });

    });

})
;
