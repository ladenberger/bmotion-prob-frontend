/**
 * BMotion Studio for ProB Graph Module
 *
 */
define(['jquery', 'bms.visualization', 'prob.observers', 'angular-xeditable'], function ($) {

    return angular.module('prob.graph', ['xeditable', 'bms.visualization', 'prob.observers'])
        .run(function () {
        })
        .factory('bmsRenderingService', ['$q', 'ws', '$injector', 'bmsObserverService', 'bmsVisualizationService', '$http', '$templateCache', function ($q, ws, $injector, bmsObserverService, bmsVisualizationService, $http, $templateCache) {

            var renderingService = {

                getStyle: function (path, style) {
                    var defer = $q.defer();
                    if (style) {
                        $http.get(path + "/" + style, {cache: $templateCache}).success(function (css) {
                            defer.resolve('<style type="text/css">\n<![CDATA[\n' + css + '\n]]>\n</style>');
                        });
                    } else {
                        defer.resolve();
                    }
                    return defer.promise;
                },
                removeBlanks: function (context, canvas, imgWidth, imgHeight) {

                    var imageData = context.getImageData(0, 0, imgWidth, imgHeight),
                        data = imageData.data,
                        getRBG = function (x, y) {
                            var offset = imgWidth * y + x;
                            return {
                                red: data[offset * 4],
                                green: data[offset * 4 + 1],
                                blue: data[offset * 4 + 2],
                                opacity: data[offset * 4 + 3]
                            };
                        },
                        isWhite = function (rgb) {
                            // many images contain noise, as the white is not a pure #fff white
                            return rgb.red > 200 && rgb.green > 200 && rgb.blue > 200;
                        },
                        scanY = function (fromTop) {
                            var offset = fromTop ? 1 : -1;

                            // loop through each row
                            for (var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {

                                // loop through each column
                                for (var x = 0; x < imgWidth; x++) {
                                    var rgb = getRBG(x, y);
                                    if (!isWhite(rgb)) {
                                        return y;
                                    }
                                }
                            }
                            return null; // all image is white
                        },
                        scanX = function (fromLeft) {
                            var offset = fromLeft ? 1 : -1;

                            // loop through each column
                            for (var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {

                                // loop through each row
                                for (var y = 0; y < imgHeight; y++) {
                                    var rgb = getRBG(x, y);
                                    if (!isWhite(rgb)) {
                                        return x;
                                    }
                                }
                            }
                            return null; // all image is white
                        };

                    var cropTop = scanY(true),
                        cropBottom = scanY(false),
                        cropLeft = scanX(true),
                        cropRight = scanX(false),
                        cropWidth = cropRight - cropLeft + 2,
                        cropHeight = cropBottom - cropTop + 2;

                    var $croppedCanvas = $("<canvas>").attr({width: cropWidth, height: cropHeight});
                    $croppedCanvas[0].getContext("2d").drawImage(canvas,
                        cropLeft, cropTop, cropWidth, cropHeight,
                        0, 0, cropWidth, cropHeight);

                    return $croppedCanvas[0];

                },
                getImageCanvasForSvg: function (svg) {

                    var deferred = $q.defer();

                    var canvas = document.createElement('canvas'),
                        context;
                    canvas.width = 50;
                    canvas.height = 50;

                    if (svg) {

                        context = canvas.getContext("2d");
                        var svgElement = $(svg);
                        var image = new Image();
                        image.crossOrigin = "anonymous";
                        canvas.width = svgElement.attr("width") === undefined ? 50 : svgElement.attr("width");
                        canvas.height = svgElement.attr("height") === undefined ? 50 : svgElement.attr("height");
                        image.onload = function () {
                            if (context) {
                                context.drawImage(this, 0, 0, this.width, this.height);
                                var croppedCanvas = renderingService.removeBlanks(context, canvas, this.width, this.height);
                                deferred.resolve(croppedCanvas);
                            } else {
                                // TODO: Report error if browser is to old!
                            }
                        };
                        image.src = 'data:image/svg+xml;base64,' + window.btoa(svg);

                    } else {
                        deferred.resolve(canvas);
                    }

                    return deferred.promise;

                },
                convertImgToBase64: function (url, callback, outputFormat) {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    var img = new Image;
                    img.crossOrigin = 'Anonymous';
                    img.onload = function () {
                        canvas.height = img.height;
                        canvas.width = img.width;
                        ctx.drawImage(img, 0, 0);
                        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
                        callback.call(this, dataURL);
                        // Clean up
                        canvas = null;
                    };
                    img.src = url;
                },
                convertSvgImagePaths: function (path, container) {
                    var defer = $q.defer();
                    // Replace image paths with embedded images
                    var imgConvert = [];
                    var cfn = function (el, attr, attrVal) {
                        var defer = $q.defer();
                        renderingService.convertImgToBase64(path + "/" + attrVal, function (dataUrl) {
                            el.attr(attr, dataUrl);
                            defer.resolve();
                        });
                        return defer.promise;
                    };
                    container.find("image").each(function (i, e) {
                        var jElement = $(e);
                        var xlinkhref = jElement.attr("xlink:href");
                        var href = jElement.attr("href");
                        if (xlinkhref) {
                            imgConvert.push(cfn(jElement, "xlink:href", xlinkhref));
                        }
                        if (href) {
                            imgConvert.push(cfn(jElement, "href", href));
                        }
                    });
                    $q.all(imgConvert).then(function () {
                        defer.resolve();
                    });
                    return defer.promise;
                },
                getEmptySnapshotDataUrl: function () {
                    var defer = $q.defer();
                    defer.resolve({
                        dataUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                        width: 25,
                        height: 25
                    });
                    return defer.promise;
                },
                getElementSnapshotAsDataUrl: function (sessionId, visualizationId, elementObservers, node, path) {

                    var defer = $q.defer();

                    // Generate for each element a single canvas image
                    var promises = [];
                    angular.forEach(elementObservers, function (obj) {
                        promises.push(function () {
                            var d = $q.defer();
                            renderingService.getElementSnapshotAsSvg(sessionId, visualizationId, obj, node, path)
                                .then(function (svg) {
                                    d.resolve(renderingService.getImageCanvasForSvg(svg));
                                });
                            return d.promise;
                        }());
                    });

                    // Merge canvas images to one single image
                    $q.all(promises)
                        .then(function (canvasList) {
                            var canvas = document.createElement('canvas');
                            var context = canvas.getContext("2d");
                            canvas.width = 50;
                            canvas.height = 50;
                            var fwidth = 0;
                            var fheight = 0;
                            var yoffset = 0;
                            angular.forEach(canvasList, function (c) {
                                fwidth = fwidth < c.width ? c.width : fwidth;
                                fheight = c.height + fheight + 15;
                            });
                            canvas.width = fwidth;
                            canvas.height = fheight;
                            angular.forEach(canvasList, function (c) {
                                context.drawImage(c, 0, yoffset);
                                yoffset = c.height + yoffset + 15;
                            });
                            return canvas;
                        })
                        .then(function (canvas) {
                            defer.resolve({
                                dataUrl: canvas.toDataURL('image/png'),
                                width: canvas.width,
                                height: canvas.height
                            });
                        });

                    return defer.promise;

                },
                getElementSnapshotAsSvg: function (sessionId, visualizationId, elementAndObservers, node, path) {

                    var defer = $q.defer();

                    var element = elementAndObservers.element;
                    var observers = elementAndObservers.observers;
                    var results = node.data['results'];

                    var clonedElement = element.clone(true);
                    var svgWrapper = $('<svg xmlns="http://www.w3.org/2000/svg" style="background-color:white" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color:white" width="1000" height="1000">').html(clonedElement);

                    // Prepare observers
                    var promises = [];
                    angular.forEach(observers, function (o) {
                            var observerInstance = $injector.get(o.type, "");
                            if (observerInstance) {
                                try {
                                    var result = observerInstance.getFormulas(o).map(function (formula) {
                                        return results[formula].result;
                                    });
                                    promises.push(observerInstance.apply(sessionId, visualizationId, o, svgWrapper, {
                                            result: result
                                        }
                                    ));
                                } catch (err) {
                                    promises.push(observerInstance.apply(sessionId, visualizationId, o, svgWrapper, {
                                        stateId: node.data.id
                                    }));
                                }
                            }
                        }
                    );

                    // Apply observers
                    $q.all(promises).then(function (data) {

                        // Collect attributes and values
                        var fvalues = {};
                        angular.forEach(data, function (value) {
                            if (value !== undefined) {
                                $.extend(true, fvalues, value);
                            }
                        });
                        // Set attribute and values
                        for (bid in fvalues) {
                            var nattrs = fvalues[bid];
                            for (a in nattrs) {
                                var orgElement = svgWrapper.find('[data-bms-id=' + bid + ']');
                                $(orgElement).attr(a, nattrs[a]);
                            }
                        }

                        // Replace image paths with embedded images
                        renderingService.convertSvgImagePaths(path, svgWrapper)
                            .then(function () {
                                /*if (css !== undefined) {
                                 svgWrapper.prepend(css);
                                 }*/
                                defer.resolve($('<div>').html(svgWrapper).html());
                            });

                    });

                    return defer.promise;

                },
                getTraceDiagramData: function (sessionId, visualizationId, selector) {
                    return renderingService.getDiagramData(sessionId, visualizationId, selector, 'createTraceDiagram', function (node) {
                        return node.data.id !== 'root' && node.data.id !== '0';
                    });
                },
                getProjectionDiagramData: function (sessionId, visualizationId, selector) {
                    return renderingService.getDiagramData(sessionId, visualizationId, selector, 'createProjectionDiagram', function (node) {
                        return node.data.id !== '1' && node.data.labels[0] !== '<< undefined >>';
                    });
                },
                getDiagramData: function (sessionId, visualizationId, selector, diagramType, diagramCond) {

                    var defer = $q.defer();

                    // TODO: Check if selector is valid
                    // TODO: Check if selector is SVG element
                    if (visualizationId && selector && selector.length > 0) {

                        var vis = bmsVisualizationService.getVisualization(visualizationId);
                        var container = vis.container.contents();
                        var elements = container.find(selector);
                        var observers = bmsObserverService.getObservers(visualizationId);

                        // (1) Attach observers to elements
                        angular.forEach(observers, function (o) {
                            var oe = container.find(o.data.selector);
                            if (oe.length) { // If element(s) exist(s)
                                oe.each(function () {
                                    var e = $(this);
                                    if (!e.data('observers')) {
                                        e.data('observers', []);
                                    }
                                    e.data('observers').push(o);
                                });
                            }
                        });

                        // (2) Generate element observer map
                        var elementObservers = [];
                        elements.each(function () {
                            var e = $(this);
                            var eo = {
                                element: e,
                                observers: e.data('observers')
                            };
                            var eleChildren = e.children();
                            if (eleChildren.length > 0) {
                                eleChildren.each(function () {
                                    var co = $(this).data('observers');
                                    if (co) {
                                        eo.observers = eo.observers.concat(co);
                                    }
                                });
                            }
                            elementObservers.push(eo);
                        });

                        // (2) Collect formulas of observers
                        var formulas = [];
                        angular.forEach(elementObservers, function (oe) {
                            angular.forEach(oe.observers, function (o) {
                                var observerInstance = $injector.get(o.type, "");
                                if (observerInstance) {
                                    try {
                                        observerInstance.getFormulas(o).forEach(function (f) {
                                            var index = formulas.indexOf(f);
                                            if (index === -1) {
                                                formulas.push(f);
                                            }
                                        });
                                    } catch (err) {

                                    }
                                }
                            });
                        });

                        // (3) Receive diagram data from ProB
                        ws.emit(diagramType, {
                            data: {
                                id: sessionId,
                                traceId: vis.traceId,
                                formulas: formulas
                            }
                        }, function (data) {

                            var promises = [];

                            // Get CSS data for HTML
                            //bmsRenderingService.getStyle(vis.data.templateFolder, vis.data.view.style).then(function (css) {

                            // Get HTML data
                            angular.forEach(data.nodes, function (node) {

                                if (diagramCond(node)) {
                                    promises.push(renderingService.getElementSnapshotAsDataUrl(sessionId, visualizationId, elementObservers, node, vis.templateFolder));
                                } else {
                                    promises.push(renderingService.getEmptySnapshotDataUrl());
                                }

                            });

                            $q.all(promises).then(function (screens) {
                                angular.forEach(data.nodes, function (n, i) {
                                    n.data.svg = screens[i].dataUrl;
                                    n.data.height = screens[i].height + 30;
                                    n.data.width = screens[i].width + 30;
                                });
                                defer.resolve(data);
                            });

                        });

                        // });

                    } else {
                        // TODO: Some nice error message
                        defer.reject();
                    }

                    return defer.promise;

                }

            };

            return renderingService;

        }])
        .factory('bmsDiagramElementProjectionGraph', ['$q', function ($q) {

            return {

                build: function (container, data) {

                    var deferred = $q.defer();

                    $(function () { // on dom ready

                        // Cytoscape needs the jquery $ variables as a global variable
                        // in order to initialise the cytoscape jquery plugin
                        window.$ = window.jQuery = $;

                        requirejs(['cytoscape', 'cytoscape.navigator'], function (cytoscape) {

                            var containerEle = $(container);
                            var graphEle = containerEle.find(".projection-diagram-graph");
                            var navigatorEle = containerEle.find(".projection-diagram-navigator");
                            graphEle.cytoscape({
                                zoomingEnabled: true,
                                userZoomingEnabled: true,
                                panningEnabled: true,
                                userPanningEnabled: true,
                                ready: function () {
                                    graphEle.cyNavigator({
                                        container: navigatorEle
                                    });
                                    deferred.resolve({cy: this, navigator: graphEle});
                                },
                                style: cytoscape.stylesheet()
                                    .selector('node')
                                    .css({
                                        'shape': 'rectangle',
                                        'width': 'data(width)',
                                        'height': 'data(height)',
                                        'content': 'data(labels)',
                                        'background-color': 'white',
                                        'border-width': 2,
                                        'border-color': 'data(color)',
                                        'font-size': '15px',
                                        'text-valign': 'top',
                                        'text-halign': 'center',
                                        'background-repeat': 'no-repeat',
                                        'background-image': 'data(svg)',
                                        'background-fit': 'none',
                                        'background-position-x': '15px',
                                        'background-position-y': '15px'
                                    })
                                    .selector('edge')
                                    .css({
                                        'content': 'data(label)',
                                        'target-arrow-shape': 'triangle',
                                        'width': 1,
                                        'line-color': 'data(color)',
                                        'line-style': 'data(style)',
                                        'target-arrow-color': 'data(color)',
                                        'font-size': '15px',
                                        'control-point-distance': 100
                                    }),
                                layout: {
                                    name: 'cose',
                                    animate: false,
                                    fit: true,
                                    padding: 25,
                                    directed: true,
                                    roots: '#1',
                                    nodeOverlap: 100, // Node repulsion (overlapping) multiplier
                                    nodeRepulsion: 3000000 // Node repulsion (non overlapping)
                                                           // multiplier
                                },
                                elements: {
                                    nodes: data.nodes,
                                    edges: data.edges
                                }
                            });

                        });

                    }); // on dom ready
                    return deferred.promise;
                }

            };

        }])
        .directive('bmsDiagramElementProjectionView', ['bmsObserverService', 'bmsRenderingService', 'bmsVisualizationService', 'bmsDiagramElementProjectionGraph', function (bmsObserverService, bmsRenderingService, bmsVisualizationService, bmsDiagramElementProjectionGraph) {

            return {
                replace: false,
                scope: {},
                template: '<div class="input-group input-group-sm" style="width:300px;margin-left:15px;">'
                + '<input type="text" class="form-control" placeholder="Selector" ng-model="selector">'
                + '<span class="input-group-btn">'
                + '<button class="btn btn-default" type="button" ng-click="createDiagram()">Go!</button>'
                + '</span>'
                + '</div>'
                + '<div class="fullWidthHeight">'
                + '<div class="projection-diagram-graph fullWidthHeight"></div>'
                + '<div class="projection-diagram-navigator"></div>'
                + '</div>',
                controller: ['$scope', function ($scope) {

                    $scope.$on('exportSvg', function () {
                        if ($scope.cy) {
                            window.open($scope.cy.png({
                                full: true,
                                scale: 2
                            }));
                        }
                    });

                }],
                link: function ($scope, $element) {

                    $scope.createDiagram = function () {

                        var currentVis = bmsVisualizationService.getCurrentVisualization();
                        var sessionId = currentVis.id;

                        bmsRenderingService.getProjectionDiagramData(sessionId, bmsVisualizationService.getCurrentVisualizationId(), $scope.selector)
                            .then(function (graphData) {
                                if (graphData) {
                                    if (!$scope.cy) {
                                        bmsDiagramElementProjectionGraph.build($element, graphData)
                                            .then(function (r) {
                                                $scope.cy = r.cy;
                                                $scope.navigator = r.navigator;
                                            });
                                    } else {
                                        $scope.cy.load(graphData, function () {
                                        }, function () {
                                        });
                                    }
                                }
                            });

                    };

                }
            }

        }])
        .factory('bmsDiagramTraceGraph', ['$q', function ($q) {

            return {

                build: function (container, data) {

                    var deferred = $q.defer();

                    $(function () { // on dom ready

                        // Cytoscape needs the jquery $ variables as a global variable
                        // in order to initialise the cytoscape jquery plugin
                        window.$ = window.jQuery = $;

                        requirejs(['cytoscape', 'cytoscape.navigator'], function (cytoscape) {

                            var containerEle = $(container);
                            var graphEle = containerEle.find(".trace-diagram-graph");
                            var navigatorEle = containerEle.find(".trace-diagram-navigator");
                            graphEle.cytoscape({
                                ready: function () {
                                    graphEle.cyNavigator({
                                        container: navigatorEle
                                    });
                                    deferred.resolve({cy: this, navigator: graphEle});
                                },
                                style: cytoscape.stylesheet()
                                    .selector('node')
                                    .css({
                                        'shape': 'rectangle',
                                        'content': 'data(label)',
                                        'width': 'data(width)',
                                        'height': 'data(height)',
                                        'background-color': 'white',
                                        'border-width': 2,
                                        'font-size': '15px',
                                        'text-valign': 'top',
                                        'text-halign': 'center',
                                        'background-repeat': 'no-repeat',
                                        'background-image': 'data(svg)',
                                        'background-fit': 'none',
                                        'background-position-x': '15px',
                                        'background-position-y': '15px'
                                    })
                                    .selector('edge')
                                    .css({
                                        'content': 'data(label)',
                                        'target-arrow-shape': 'triangle',
                                        'width': 1,
                                        'line-color': 'black',
                                        'target-arrow-color': 'black',
                                        'color': 'black',
                                        'font-size': '15px',
                                        'control-point-distance': 60
                                    }),
                                layout: {
                                    name: 'circle',
                                    animate: false,
                                    fit: true,
                                    padding: 30,
                                    directed: true,
                                    avoidOverlap: true,
                                    roots: '#root'
                                },
                                elements: {
                                    nodes: data.nodes,
                                    edges: data.edges
                                }
                            });

                        });

                    }); // on dom ready
                    return deferred.promise;
                }

            };

        }])
        .directive('bmsDiagramTraceView', ['bmsObserverService', 'bmsRenderingService', 'bmsVisualizationService', 'bmsDiagramTraceGraph', function (bmsObserverService, bmsRenderingService, bmsVisualizationService, bmsDiagramTraceGraph) {
            return {
                replace: false,
                scope: {},
                template: '<div class="input-group input-group-sm" style="width:300px;margin-left:15px;">'
                + '<input type="text" class="form-control" placeholder="Selector" ng-model="selector">'
                + '<span class="input-group-btn">'
                + '<button class="btn btn-default" type="button" ng-click="createDiagram()">Go!</button>'
                + '</span>'
                + '</div>'
                + '<div class="fullWidthHeight">'
                + '<div class="trace-diagram-graph fullWidthHeight"></div>'
                + '<div class="trace-diagram-navigator"></div>'
                + '</div>',
                controller: ['$scope', function ($scope) {

                    $scope.$on('exportSvg', function () {
                        if ($scope.cy) {
                            window.open($scope.cy.png({
                                full: true,
                                scale: 2
                            }));
                        }
                    });

                }],
                link: function ($scope, $element) {

                    $scope.createDiagram = function () {

                        var currentVis = bmsVisualizationService.getCurrentVisualization();
                        var sessionId = currentVis.id;

                        bmsRenderingService.getTraceDiagramData(sessionId, bmsVisualizationService.getCurrentVisualizationId(), $scope.selector)
                            .then(function (graphData) {
                                if (graphData) {
                                    if (!$scope.cy) {
                                        bmsDiagramTraceGraph.build($element, graphData)
                                            .then(function (r) {
                                                $scope.cy = r.cy;
                                                $scope.navigator = r.navigator;
                                            });
                                    } else {
                                        $scope.cy.load(graphData, function () {
                                        }, function () {
                                        });
                                    }
                                }
                            });

                    };

                }
            }

        }]);

});
