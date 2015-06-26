/**
 * BMotion Studio for ProB Graph Module
 *
 */
define(['bms.visualization', 'prob.observers', 'angular-xeditable', 'cytoscape', 'cytoscape.navigator'], function () {

    return angular.module('prob.graph', ['xeditable', 'bms.visualization', 'prob.observers'])
        .factory('bmsRenderingService', ['$q', '$injector', 'bmsObserverService', '$http', '$templateCache', function ($q, $injector, bmsObserverService, $http, $templateCache) {

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

                        if (Object.prototype.toString.call(svg) === '[object Array]') {

                            var promises = [];
                            angular.forEach(svg, function (s) {
                                promises.push(renderingService.getImageCanvasForSvg(s));
                            });
                            $q.all(promises).then(function (data) {
                                var fwidth = 0;
                                var fheight = 0;
                                var yoffset = 0;
                                angular.forEach(data, function (c) {
                                    fwidth = fwidth < c.width ? c.width : fwidth;
                                    fheight = c.height + fheight + 15;
                                });
                                canvas.width = fwidth;
                                canvas.height = fheight;
                                angular.forEach(data, function (c) {
                                    context.drawImage(c, 0, yoffset);
                                    yoffset = c.height + yoffset + 15;
                                });
                                deferred.resolve(canvas);
                            });

                        } else {

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

                        }

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
                getVisualizationSnapshotAsSvg: function (vis, view, stateid, css) {

                    var defer = $q.defer();

                    var container = view.container.clone(true);
                    var observers = vis.observers;
                    //var traceId = template.data.traceId;
                    var path = vis.data.templatePath;

                    bmsObserverService.checkObservers(vis.data.id, observers, container, stateid).then(function (data) {

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
                                var orgElement = container.find('[data-bms-id=' + bid + ']');
                                $(orgElement).attr(a, nattrs[a]);
                            }
                        }

                        // Replace image paths with embedded images
                        renderingService.convertSvgImagePaths(path, container).then(function () {
                            if (css !== undefined) {
                                container.prepend(css);
                            }
                            defer.resolve($('<div>').html(container).html());
                        });

                    });

                    return defer.promise;

                },
                getVisualizationSnapshotAsDataUrl: function (template, view, stateid, css) {

                    var defer = $q.defer();
                    renderingService.getVisualizationSnapshotAsSvg(template, view, stateid, css).then(function (svg) {
                        renderingService.getImageCanvasForSvg(svg).then(function (canvas) {
                            defer.resolve({
                                dataUrl: canvas.toDataURL('image/png'),
                                width: canvas.width,
                                height: canvas.height
                            });
                        });
                    });
                    return defer.promise;

                },
                getElementSnapshotAsDataUrl: function (element, results, data, css, path) {
                    var defer = $q.defer();
                    renderingService.getElementSnapshotAsSvg(element, results, data, css, path).then(function (svg) {
                        renderingService.getImageCanvasForSvg(svg).then(function (canvas) {
                            defer.resolve({
                                dataUrl: canvas.toDataURL('image/png'),
                                width: canvas.width,
                                height: canvas.height
                            });
                        });
                    });
                    return defer.promise;
                },
                getElementSnapshotAsSvg: function (element, results, data, css, path) {

                    var defer = $q.defer();

                    if (Object.prototype.toString.call(element) === '[object Array]') {

                        var promises = [];
                        angular.forEach(element, function (ele) {
                            promises.push(renderingService.getElementSnapshotAsSvg(ele, results, data, css, path));
                        });
                        $q.all(promises).then(function (data) {
                            defer.resolve(data);
                        });

                    } else {

                        var container = element.container.clone(true);

                        // Collect all observers
                        var allObserver = element.observers;
                        angular.forEach(element.children, function (c) {
                            var child = data[c];
                            if (child) {
                                allObserver = allObserver.concat(child.observers);
                            }
                        });

                        // Prepare observers
                        var promises = [];
                        angular.forEach(allObserver, function (o) {
                            var observerInstance = $injector.get(o.type, "");
                            if (observerInstance) {
                                promises.push(observerInstance.apply(o, container, o['count'].map(function (pos) {
                                    return results[pos];
                                })));
                            }
                        });

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
                                    var orgElement = container.find('[data-bms-id=' + bid + ']');
                                    $(orgElement).attr(a, nattrs[a]);
                                }
                            }

                            // Create HTML/SVG string
                            var screenEle = container.find('[data-bms-id=' + element.bmsid + ']');
                            var svgWrapper = $('<svg xmlns="http://www.w3.org/2000/svg" style="background-color:white" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color:white" width="1000" height="1000">').html(screenEle);

                            // Replace image paths with embedded images
                            renderingService.convertSvgImagePaths(path, svgWrapper).then(function () {
                                if (css !== undefined) {
                                    svgWrapper.prepend(css);
                                }
                                defer.resolve($('<div>').html(svgWrapper).html());
                            });

                        });

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
                    }); // on dom ready
                    return deferred.promise;
                }
            };

        }])
        .directive('bmsDiagramElementProjectionView', ['bmsObserverService', 'bmsRenderingService', 'bmsVisualizationService', 'bmsDiagramElementProjectionGraph', 'ws', '$injector', '$http', '$q', '$templateCache', '$filter', function (bmsObserverService, bmsRenderingService, bmsVisualizationService, bmsDiagramElementProjectionGraph, ws, $injector, $http, $q, $templateCache, $filter) {

            return {
                replace: false,
                scope: {},
                template: '<div>'
                + '<a href="#" editable-select="visualisationSelection.selected" buttons="no" onshow="loadVisualisations()" e-ng-options="s.value as s.name for s in visualisationSelection.data">'
                + '{{ showVisualisationSelection() }}'
                + '</a>'
                + '<a style="margin-left:10px" href="#" editable-select="elementSelection.selected" e-multiple onshow="loadElements()" e-ng-options="s.value as s.text for s in elementSelection.data">'
                + '{{ showElementSelection() }}'
                + '</a>'
                + '</div>'
                + '<div class="fullWidthHeight">'
                + '<div class="projection-diagram-graph fullWidthHeight"></div>'
                + '<div class="projection-diagram-navigator"></div>'
                + '</div>',
                controller: ['$scope', function ($scope) {

                    $scope.visualisationSelection = {
                        data: [],
                        selected: undefined
                    };

                    $scope.elementSelection = {
                        observerBmsIdMap: {},
                        data: [],
                        selected: []
                    };

                    $scope.$on('exportSvg', function () {
                        if ($scope.cy) {
                            window.open($scope.cy.png({
                                full: true,
                                scale: 2
                            }));
                        }
                    });

                    $scope.showElementSelection = function () {
                        var selected = [];
                        angular.forEach($scope.elementSelection.data, function (s) {
                            if ($scope.elementSelection.selected.indexOf(s.value) >= 0) {
                                selected.push(s.text);
                            }
                        });
                        return selected.length ? selected.join(', ') : 'Graphical Element';
                    };

                    $scope.showVisualisationSelection = function () {
                        var selected = $scope.getVisualisationSelection();
                        return selected ? selected.name : 'Visualisation';
                    };

                    $scope.getVisualisationSelection = function () {
                        var selected = $filter('filter')($scope.visualisationSelection.data, {value: $scope.visualisationSelection.selected});
                        return selected[0];
                    };

                    $scope.loadVisualisations = function () {
                        var data = [];
                        angular.forEach(bmsVisualizationService.getVisualizations(), function (v, i) {
                            if (v.view) {
                                data.push({
                                    value: data.length + 1,
                                    name: v.name + ' (' + i + ')',
                                    container: v.container,
                                    observers: bmsObserverService.getObservers(i),
                                    data: v
                                });
                            }
                        });
                        $scope.visualisationSelection.data = data;
                    };

                    $scope.loadElements = function () {

                        var selectedVisualisation = $scope.getVisualisationSelection();

                        if (selectedVisualisation) {

                            var data = [];
                            var bmsIdDataMap = {};

                            var container = selectedVisualisation.container;
                            var observers = selectedVisualisation.observers;

                            // Clone SVG elements
                            var clonedElements = {};
                            angular.forEach(selectedVisualisation.data.view.elements, function (v) {
                                var projectionElement = container.contents().find(v);
                                clonedElements[v] = projectionElement.clone(true);
                            });

                            // Collect elements
                            angular.forEach(observers, function (o) {
                                if (o.type === "formula" || o.type === "predicate") {
                                    var ele = container.contents().find('[data-bms-id=' + o.bmsid + ']');
                                    if (bmsIdDataMap[o.bmsid] === undefined) {

                                        var id = ele.attr("id");
                                        var svgParent = ele.closest("svg");
                                        var svgId = svgParent.attr("id");
                                        bmsIdDataMap[o.bmsid] = {
                                            container: clonedElements["#" + svgId],
                                            observers: [],
                                            children: [],
                                            bmsid: o.bmsid
                                        };
                                        var eleChildren = ele.children();
                                        if (eleChildren.length > 0) {
                                            eleChildren.each(function (i, ele) {
                                                bmsIdDataMap[o.bmsid].children.push($(ele).attr('data-bms-id'));
                                            });
                                        }
                                        data.push({
                                            value: data.length + 1,
                                            text: id == undefined ? o.bmsid : id,
                                            bmsid: o.bmsid
                                        });

                                    }
                                    bmsIdDataMap[o.bmsid]['observers'].push(o);
                                }
                            });

                            $scope.elementSelection.data = data;
                            $scope.elementSelection.bmsIdDataMap = bmsIdDataMap;

                        }

                    };

                    $scope.$watch('elementSelection.selected', function (newValue) {
                        if (newValue && newValue.length > 0) {
                            var elements = [];
                            angular.forEach($scope.elementSelection.data, function (s) {
                                if (newValue.indexOf(s.value) >= 0) {
                                    elements.push($scope.elementSelection.bmsIdDataMap[s.bmsid]);
                                }
                            });

                            var start = new Date().getTime();
                            $scope.getData(elements, $scope.getVisualisationSelection()).then(function (data) {

                                var endPredicate = new Date().getTime();
                                var time = endPredicate - start;
                                console.log('TIME DSP: ' + time);
                                $scope.loadData(data);
                            });
                        }
                    });

                    $scope.getData = function (elements, vis) {

                        var defer = $q.defer();

                        if (elements.length > 0) {

                            // (1) Collect observers
                            var allObserver = [];
                            angular.forEach(elements, function (v) {

                                allObserver = allObserver.concat(v.observers);
                                // Collect observer also from children
                                angular.forEach(v.children, function (c) {
                                    var childData = $scope.elementSelection.bmsIdDataMap[c];
                                    if (childData) {
                                        allObserver = allObserver.concat(childData.observers);
                                    }
                                });

                            });

                            // (2) Collect formulas of observers
                            var formulas = [];
                            angular.forEach(allObserver, function (o) {
                                o['count'] = [];
                                var observerInstance = $injector.get(o.type, "");
                                if (observerInstance) {
                                    var ff = observerInstance.getFormulas(o);
                                    angular.forEach(ff, function (formula) {
                                        var index = formulas.indexOf(formula);
                                        if (index === -1) {
                                            formulas.push(formula);
                                            index = formulas.indexOf(formula);
                                        }
                                        o['count'].push(index);
                                    });
                                }
                            });

                            // (3) Send formulas to ProB and receive diagram data
                            ws.emit('createCustomTransitionDiagram', {
                                data: {
                                    id: vis.data.id,
                                    expressions: formulas,
                                    traceId: vis.data.traceId
                                }
                            }, function (data) {

                                var promises = [];

                                // Get CSS data for HTML
                                bmsRenderingService.getStyle(vis.data.templateFolder, vis.data.view.style).then(function (css) {

                                    // Get HTML data
                                    angular.forEach(data.nodes, function (node) {
                                        var results = node.data.results;
                                        if (node.data.id !== '1' && node.data.labels[0] !== '<< undefined >>') {
                                            promises.push(bmsRenderingService.getElementSnapshotAsDataUrl(elements, results, $scope.elementSelection.bmsIdDataMap, css, vis.data.templatePath));
                                        } else {
                                            promises.push(bmsRenderingService.getEmptySnapshotDataUrl());
                                        }
                                    });

                                    $q.all(promises).then(function (screens) {
                                        angular.forEach(data.nodes, function (n, i) {
                                            n.data.svg = screens[i].dataUrl;
                                            n.data.height = screens[i].height + 15;
                                            n.data.width = screens[i].width + 30;
                                        });
                                        defer.resolve(data);
                                    });

                                });

                            });

                        } else {
                            defer.resolve();
                        }

                        return defer.promise;

                    };

                    /*$scope.refreshDiagram = function () {
                     if ($scope.cy) {
                     $scope.cy.load($scope.cy.elements().jsons())
                     }
                     $scope.refreshNavigator();
                     };

                     $scope.refreshNavigator = function () {
                     if ($scope.navigator) {
                     $scope.navigator.cytoscapeNavigator('resize');
                     }
                     };*/

                }],
                link: function ($scope, $element, attrs) {

                    /*ctrl.onEventListener('resizeStop', function () {
                     $scope.refreshDiagram();
                     });*/

                    $scope.loadData = function (data) {
                        var defer = $q.defer();
                        if (data) {
                            if (!$scope.cy) {
                                bmsDiagramElementProjectionGraph.build($element, data).then(function (result) {
                                    $scope.cy = result.cy;
                                    $scope.navigator = result.navigator;
                                    defer.resolve();
                                });
                            } else {
                                $scope.cy.load(data, function () {
                                }, function () {
                                    defer.resolve();
                                });
                                //$scope.refreshNavigator();
                            }
                        }
                        return defer.promise;
                    };

                }
            }

        }])
        .factory('bmsDiagramTraceGraph', ['$q', function ($q) {

            return {

                build: function (container, data) {
                    var deferred = $q.defer();
                    $(function () { // on dom ready
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
                    }); // on dom ready
                    return deferred.promise;
                }
            };

        }])
        .directive('bmsDiagramTraceView', ['bmsObserverService', '$filter', 'bmsVisualizationService', 'bmsDiagramTraceGraph', 'ws', '$compile', 'bmsRenderingService', '$q', function (bmsObserverService, $filter, bmsbmsVisualizationServiceVisualisationService, bmsDiagramTraceGraph, ws, $compile, bmsRenderingService, $q) {
            return {
                replace: false,
                scope: {},
                template: '<div>'
                + '<a href="#" editable-select="visualisationSelection.selected" buttons="no" onshow="loadVisualisations()" e-ng-options="s.value as s.name for s in visualisationSelection.data">'
                + '{{ showVisualisationSelection() }}'
                + '</a>'
                + '<a style="margin-left:10px" href="#" editable-select="viewSelection.selected" onshow="loadViews()" e-ng-options="s.value as s.text for s in viewSelection.data">'
                + '{{ showViewSelection() }}'
                + '</a>'
                + '</div>'
                + '<div class="fullWidthHeight">'
                + '<div class="trace-diagram-graph fullWidthHeight"></div>'
                + '<div class="trace-diagram-navigator"></div>'
                + '</div>',
                controller: ['$scope', function ($scope) {

                    $scope.visualisationSelection = {
                        data: [],
                        selected: undefined
                    };

                    $scope.viewSelection = {
                        data: [],
                        selected: undefined
                    };

                    $scope.getVisualisationSelection = function () {
                        var selected = $filter('filter')($scope.visualisationSelection.data, {value: $scope.visualisationSelection.selected});
                        return selected[0];
                    };

                    $scope.showVisualisationSelection = function () {
                        var selected = $scope.getVisualisationSelection();
                        return selected ? selected.name : 'Visualisation';
                    };

                    $scope.loadVisualisations = function () {
                        var data = [];
                        angular.forEach(bmsVisualizationService.getVisualizations(), function (v, i) {
                            if (v.view) {
                                data.push({
                                    value: data.length + 1,
                                    name: v.name + ' (' + i + ')',
                                    observers: bmsObserverService.getObservers(i),
                                    container: v.container,
                                    data: v
                                });
                            }
                        });
                        $scope.visualisationSelection.data = data;
                    };

                    $scope.loadViews = function () {

                        var selectedVisualisation = $scope.getVisualisationSelection();
                        if (selectedVisualisation) {
                            var data = [];
                            var view = selectedVisualisation.data.view;
                            if (view) {
                                angular.forEach(view.elements, function (e) {
                                    data.push({
                                        value: data.length + 1,
                                        text: e,
                                        container: selectedVisualisation.container.contents().find(e)
                                    });
                                });
                            }
                            $scope.viewSelection.data = data;
                        }

                    };

                    $scope.getSelectedView = function () {
                        var selected = $filter('filter')($scope.viewSelection.data, {value: $scope.viewSelection.selected});
                        return selected[0];
                    };

                    $scope.showViewSelection = function () {
                        var selected = $scope.getSelectedView();
                        return selected ? selected.text : 'View';
                    };

                    $scope.$watch('viewSelection.selected', function (newValue) {
                        if (newValue) {
                            $scope.getData($scope.getVisualisationSelection(), $scope.getSelectedView()).then(function (data) {
                                $scope.loadData(data);
                            });
                        }
                    });

                    $scope.getData = function (vis, view) {

                        var defer = $q.defer();

                        ws.emit('createTraceDiagram', {
                            data: {
                                id: vis.data.id,
                                traceId: vis.data.traceId
                            }
                        }, function (data) {

                            var promises = [];

                            bmsRenderingService.getStyle(vis.data.templateFolder, vis.data.view.style).then(function (css) {

                                angular.forEach(data.nodes, function (n) {
                                    if (n.data.id !== 'root' && n.data.id !== '0') {
                                        promises.push(bmsRenderingService.getVisualizationSnapshotAsDataUrl(vis, view, n.data.id, css));
                                    } else {
                                        promises.push(bmsRenderingService.getEmptySnapshotDataUrl());
                                    }
                                });

                                $q.all(promises).then(function (screens) {
                                    angular.forEach(data.nodes, function (n, i) {
                                        n.data.svg = screens[i].dataUrl;
                                        n.data.height = screens[i].height + 15;
                                        n.data.width = screens[i].width + 30;
                                    });
                                    defer.resolve(data);
                                });

                            });

                        });

                        return defer.promise;

                    };

                    /*$scope.refreshDiagram = function () {
                     if ($scope.cy) {
                     $scope.cy.load($scope.cy.elements().jsons())
                     }
                     $scope.refreshNavigator();
                     };

                     $scope.refreshNavigator = function () {
                     if ($scope.navigator) {
                     $scope.navigator.cytoscapeNavigator('resize');
                     }
                     };

                     $scope.$on('refreshDiagram', function () {
                     $scope.refreshDiagram();
                     });*/

                    $scope.$on('exportSvg', function () {
                        if ($scope.cy) {
                            window.open($scope.cy.png({
                                full: true,
                                scale: 2
                            }));
                        }
                    });

                }],
                link: function ($scope, $element, attrs, ctrl) {

                    $scope.loadData = function (data) {
                        var defer = $q.defer();
                        if (data) {
                            if (!$scope.cy) {
                                bmsDiagramTraceGraph.build($element, data).then(function (result) {
                                    $scope.cy = result.cy;
                                    $scope.navigator = result.navigator;
                                    defer.resolve();
                                });
                            } else {
                                $scope.cy.load(data, function () {
                                }, function () {
                                    defer.resolve();
                                });
                                //$scope.refreshNavigator();
                            }
                        }
                        return defer.promise;
                    };

                }
            }

        }]);

});
