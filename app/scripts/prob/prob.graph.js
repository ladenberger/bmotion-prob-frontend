/**
 * BMotion Studio for ProB Graph Module
 *
 */
define(['prob.api', 'angular', 'jquery', 'xeditable', 'cytoscape', 'cytoscape.navigator'], function (prob) {

    return angular.module('prob.graph', ['xeditable', 'bms.main'])
        .factory('bmsRenderingService', ['$q', function ($q) {

            var renderingService = {

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
                getStyle: function (path) {
                    var deferred = $.Deferred();
                    $.when($.get(path)).done(function (response) {
                        deferred.resolve(response);
                    });
                    return deferred.promise();
                },
                getStyles: function () {
                    var deferred = $.Deferred();
                    var bmsStyles = $('head').find('[data-bms-style]');
                    var styleLoaders = [];
                    $.each(bmsStyles, function (i, v) {
                        var href = $(v).attr('href');
                        styleLoaders.push(renderingService.getStyle(href));
                    });
                    $.when.apply(null, styleLoaders).done(function () {
                        var styles = '';
                        $.each(arguments, function (i, css) {
                            styles = styles + '\n' + css;
                        });
                        deferred.resolve('<style type="text/css">\n<![CDATA[\n' + styles + '\n]]>\n</style>');
                    });
                    return deferred.promise();
                },
                loadImages: function (node, htmlList) {

                    var deferred = $q.defer();

                    var image = new Image(),
                        canvas = document.createElement('canvas'),
                        context;

                    context = canvas.getContext("2d");

                    var promises = [];

                    angular.forEach(htmlList, function (h) {
                        promises.push(renderingService.loadImage(node, h));
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

                        node.data['svg'] = canvas.toDataURL('image/png');
                        node.data['width'] = canvas.width + 30;
                        node.data['height'] = canvas.height + 30;
                        deferred.resolve();

                    });

                    return deferred.promise;

                },
                loadImage: function (node, html) {

                    var deferred = $q.defer();

                    var image = new Image(),
                        canvas = document.createElement('canvas'),
                        context;

                    if (html !== undefined) {
                        var svgElement = $(html);
                        image.crossOrigin = "anonymous";
                        canvas.width = svgElement.attr("width") === undefined ? 100 : svgElement.attr("width");
                        canvas.height = svgElement.attr("height") === undefined ? 100 : svgElement.attr("height");
                        context = canvas.getContext("2d");
                        image.onload = function () {
                            if (context) {
                                context.drawImage(this, 0, 0, this.width, this.height);
                                var croppedCanvas = renderingService.removeBlanks(context, canvas, this.width, this.height);
                                var uri = croppedCanvas.toDataURL('image/png');
                                node.data['svg'] = uri;
                                node.data['width'] = croppedCanvas.width + 30;
                                node.data['height'] = croppedCanvas.height + 30;
                                deferred.resolve(croppedCanvas);
                            } else {
                                // TODO: Report error if browser is to old!
                            }
                        };
                        image.src = 'data:image/svg+xml;base64,' + window.btoa(html);
                    } else {
                        node.data['svg'] = 'data:image/svg+xml;base64,';
                        node.data['width'] = 50;
                        node.data['height'] = 50;
                        deferred.resolve(canvas);
                    }

                    return deferred.promise;

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
                        var navigatorEle = containerEle.find(".projection-diagramnavigator");
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
                                    'font-size': '11px',
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
                                    'font-size': '11px',
                                    'control-point-distance': 60
                                }),
                            layout: {
                                name: 'cose',
                                animate: false,
                                fit: true,
                                padding: 25,
                                directed: true,
                                roots: '#1',
                                //nodeOverlap: 100, // Node repulsion (overlapping) multiplier
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
        .directive('bmsDiagramElementProjectionView', ['bmsObserverService', 'bmsRenderingService', 'bmsScreenshotService', 'bmsVisualisationService', 'bmsDiagramElementProjectionGraph', 'ws', '$injector', '$http', '$q', '$templateCache', '$filter', function (bmsObserverService, bmsRenderingService, bmsScreenshotService, bmsVisualisationService, bmsDiagramElementProjectionGraph, ws, $injector, $http, $q, $templateCache, $filter) {

            function convertImgToBase64(url, callback, outputFormat) {
                var canvas = document.createElement('CANVAS');
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
            }

            var makeElementScreenshots = function (bmsids, bmsIdData, observers, results, css, visName) {

                var defer = $q.defer();

                var promises = [];
                angular.forEach(bmsids, function (id) {
                    promises.push(makeElementScreenshot(id, bmsIdData[id]['container'].clone(), observers, results, css, visName));
                });
                $q.all(promises).then(function (data) {
                    defer.resolve(data);
                });

                return defer.promise;

            };

            var makeElementScreenshot = function (bmsid, container, observers, results, css, visName) {

                var defer = $q.defer();

                var promises = [];

                angular.forEach(observers, function (o) {
                    var observerInstance = $injector.get(o.type, "");
                    if (observerInstance) {
                        promises.push(observerInstance.apply(o, container, o['count'].map(function (pos) {
                            return results[pos];
                        })));
                    }
                });

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
                    var screenEle = container.find('[data-bms-id=' + bmsid + ']');
                    var svgWrapper = $('<svg xmlns="http://www.w3.org/2000/svg" style="background-color:white" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color:white" width="1000" height="1000">').html(screenEle);

                    // Replace image paths with embedded images
                    var imgConvert = [];
                    svgWrapper.find("image").each(function (i, e) {
                        var src = $(e).attr("xlink:href");
                        imgConvert.push(function () {
                            var defer = $q.defer();
                            convertImgToBase64(visName + "/" + src, function (dataUrl) {
                                $(e).attr("xlink:href", dataUrl);
                                defer.resolve();
                            });
                            return defer.promise;
                        }());
                    });

                    $q.all(imgConvert).then(function () {
                        if (css !== undefined) {
                            svgWrapper.prepend(css);
                        }
                        var divWrapper = $('<div>').html(svgWrapper);
                        defer.resolve(divWrapper.html());
                    });

                });

                return defer.promise;

            };

            var makeEmptyScreenshot = function () {
                var defer = $q.defer();
                defer.resolve(['<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>']);
                return defer.promise;
            };

            return {
                replace: false,
                scope: true,
                template: '<div style="width:100%;height:100%;">'
                + '<div style="float:left">'
                + '<a href="#" editable-select="visualisationSelection.selected" buttons="no" onshow="loadVisualisations()" e-ng-options="s.value as s.text for s in visualisationSelection.data">'
                + '{{ showVisualisationSelection() }}'
                + '</a>'
                + '<a style="margin-left:10px" href="#" editable-select="elementSelection.selected" e-multiple onshow="loadElements()" e-ng-options="s.value as s.text for s in elementSelection.data">'
                + '{{ showElementSelection() }}'
                + '</a>'
                + '</div>'
                + '<div style="float:right"><button type="button" class="btn btn-default btn-xs" ng-click="export()"><span class="glyphicon glyphicon-export"></span></button></div>'
                + '<div class="projection-diagram-graph" style="height:100%;width:80%;float:left;"></div>'
                + '<div class="projection-diagramnavigator" style="float:left;height:100%;width:20%;position:relative;bottom:0;right:0;"></div>'
                + '</div>',
                link: function ($scope, $element) {

                    $scope.visualisationSelection = {
                        data: [],
                        selected: undefined
                    };

                    $scope.elementSelection = {
                        observerBmsIdMap: {},
                        style: undefined,
                        template: undefined,
                        data: [],
                        selected: []
                    };

                    $scope.export = function () {
                        if ($scope.cy) {
                            window.open($scope.cy.png({
                                full: true,
                                scale: 2
                            }));
                        }
                    };

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
                        var selected = $filter('filter')($scope.visualisationSelection.data, {value: $scope.visualisationSelection.selected});
                        return ($scope.visualisationSelection.selected && selected.length) ? selected[0].text : 'Visualization';
                    };

                    $scope.loadVisualisations = function () {
                        var data = [];
                        angular.forEach(bmsVisualisationService.getVisualisations(), function (v, i) {
                            if (v.projection) {
                                data.push({
                                    value: data.length + 1,
                                    text: i,
                                    projection: v.projection
                                });
                            }
                        });
                        $scope.visualisationSelection.data = data;
                    };

                    $scope.loadElements = function () {

                        var selectedVisualisation = $scope.getSelectedVisualisation();

                        if (selectedVisualisation) {

                            var data = [];
                            var bmsIdData = {};

                            var visData = bmsVisualisationService.getVisualisation(selectedVisualisation.text);
                            var observers = bmsObserverService.getObservers(selectedVisualisation.text);
                            var iframe = visData.iframe;

                            // Clone SVG elements
                            var clonedElements = {};
                            angular.forEach(selectedVisualisation.projection.elements, function (v) {
                                var projectionElement = iframe.contents().find(v);
                                clonedElements[v] = projectionElement.clone(true);
                            });

                            // Collect elements
                            angular.forEach(observers, function (o) {
                                if (o.type === "formula" || o.type === "predicate") {
                                    var ele = iframe.contents().find('[data-bms-id=' + o.bmsid + ']');
                                    if (bmsIdData[o.bmsid] === undefined) {
                                        var id = ele.attr("id");
                                        var svgParent = ele.closest("svg");
                                        var svgId = svgParent.attr("id");
                                        bmsIdData[o.bmsid] = {
                                            observers: [],
                                            container: clonedElements["#" + svgId]
                                        };
                                        data.push({
                                            value: data.length + 1,
                                            text: id == undefined ? o.bmsid : id,
                                            bmsid: o.bmsid
                                        });
                                    }
                                    bmsIdData[o.bmsid]['observers'].push(o);
                                }
                            });

                            $scope.elementSelection.data = data;
                            $scope.elementSelection.style = selectedVisualisation.projection.style;
                            $scope.elementSelection.bmsIdData = bmsIdData;

                        }

                    };

                    $scope.getSelectedVisualisation = function () {
                        var selected = $filter('filter')($scope.visualisationSelection.data, {value: $scope.visualisationSelection.selected});
                        return selected[0];
                    };

                    $scope.$watch('elementSelection.selected', function (newValue) {
                        if (newValue) {
                            var bmsids = [];
                            angular.forEach($scope.elementSelection.data, function (s) {
                                if (newValue.indexOf(s.value) >= 0) {
                                    bmsids.push(s.bmsid);
                                }
                            });
                            $scope.getData(bmsids).then(function (data) {
                                $scope.loadData(data);
                            });
                        }
                    });

                    $scope.getData = function (bmsids) {

                        var defer = $q.defer();

                        if (bmsids.length > 0) {

                            var selectedVisualisation = $scope.getSelectedVisualisation();
                            var visData = bmsVisualisationService.getVisualisation(selectedVisualisation.text);
                            var iframe = visData.iframe;

                            // (1) Collect observers
                            var allObserver = [];
                            angular.forEach(bmsids, function (v) {
                                allObserver = allObserver.concat($scope.elementSelection.bmsIdData[v]['observers']);
                                // Collect observer also from children
                                var jElement = iframe.contents().find('[data-bms-id=' + v + ']');
                                var jChildren = jElement.children();
                                if (jChildren.length > 0) {
                                    jChildren.each(function (i, ele) {
                                        var childBmsId = $(ele).attr('data-bms-id');
                                        var childData = $scope.elementSelection.bmsIdData[childBmsId]['observers'];
                                        if (childData) {
                                            allObserver = allObserver.concat(childData);
                                        }
                                    });
                                }
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
                                data: {expressions: formulas}
                            }, function (data) {

                                var promises = [];

                                var visName = $scope.getSelectedVisualisation().text;

                                // Get CSS data for HTML
                                bmsScreenshotService.getStyle(visName + "/" + $scope.elementSelection.style).then(function (css) {

                                    // Get HTML data
                                    angular.forEach(data.nodes, function (node) {
                                        var results = node.data.results;
                                        if (node.data.id !== '1') {
                                            promises.push(makeElementScreenshots(bmsids, $scope.elementSelection.bmsIdData, allObserver, results, css, visName));
                                        } else {
                                            promises.push(makeEmptyScreenshot());
                                        }
                                    });

                                    // Convert to images
                                    $q.all(promises).then(function (screens) {
                                        var loaders = [];
                                        $.each(data.nodes, function (i, v) {
                                            loaders.push(bmsRenderingService.loadImages(v, screens[i]));
                                        });
                                        $q.all(loaders).then(function () {
                                            defer.resolve(data);
                                        });
                                    });

                                });

                            });

                        } else {
                            defer.resolve();
                        }

                        return defer.promise;

                    };

                    $scope.loadData = function (data) {
                        if (data) {
                            if (!$scope.cy) {
                                bmsDiagramElementProjectionGraph.build($element, data).then(function (result) {
                                    $scope.cy = result.cy;
                                    $scope.navigator = result.navigator;
                                });
                            } else {
                                $scope.cy.load(data);
                                $scope.refreshNavigator();
                            }
                        }
                    };

                    $scope.refreshDiagram = function () {
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
                    });

                }
            }

        }])
        .controller('bmsDiagramCtrl', ['$scope', function ($scope) {
            $scope.$on('open', function () {
                $scope.$broadcast('initDiagram');
            });
            $scope.$on('resizeStop', function () {
                $scope.$broadcast('refreshDiagram');
            });
        }])
        .factory('bmsDiagramTraceGraph', ['$q', 'ws', 'bmsRenderingService', function ($q, ws, bmsRenderingService) {

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
                                    'font-size': '11px',
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
                                    'font-size': '20px',
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
        .directive('bmsDiagramTraceView', ['bmsScreenshotService', '$filter', 'bmsVisualisationService', 'bmsDiagramTraceGraph', 'ws', '$compile', 'bmsRenderingService', '$q', function (bmsScreenshotService, $filter, bmsVisualisationService, bmsDiagramTraceGraph, ws, $compile, bmsRenderingService, $q) {
            return {
                replace: false,
                template: '<div style="height:100%;width:100%;">'
                + '<div>'
                + '<span>Visualisation: </span><a href="#" editable-select="elementSelection.selected" buttons="no" onshow="loadVisElements()" e-ng-options="s.value as s.text for s in elementSelection.data">'
                + '{{ showStatus() }}'
                + '</a>'
                + '</div>'
                + '<div class="trace-diagram-graph" style="height:100%;width:80%;float:left;"></div>'
                + '<div class="trace-diagram-navigator" style="float:left;height:100%;width:20%;position:relative;bottom:0;right:0;"></div>'
                + '</div>',
                controller: ['$scope', function ($scope) {

                    $scope.elementSelection = {
                        data: [],
                        selected: undefined
                    };

                    $scope.loadVisElements = function () {
                        var data = [];
                        var vis = bmsVisualisationService.getVisualisations();
                        for (p in vis) {
                            data.push({
                                value: data.length + 1,
                                text: p
                            });
                        }
                        $scope.elementSelection.data = data;
                    };

                    $scope.showStatus = function () {
                        var selected = $filter('filter')($scope.elementSelection.data, {value: $scope.elementSelection.selected});
                        return ($scope.elementSelection.selected && selected.length) ? selected[0].text : 'Not set';
                    };

                }],
                link: function ($scope, $element, attrs) {

                    $scope.$watch('elementSelection.selected', function (newValue) {
                        if (newValue) {
                            $scope.getData().then(function (data) {
                                $scope.loadData(data);
                            });
                        }
                    });

                    $scope.getData = function () {

                        var defer = $q.defer();

                        ws.emit('createTraceDiagram', {}, function (data) {

                            var promises = [];

                            angular.forEach(data.nodes, function (n) {
                                if (n.data.id !== 'root') {
                                    promises.push(bmsScreenshotService.makeScreenshot($scope.showStatus(), n.data.id));
                                }
                            });

                            var stateHtmlMap = {};
                            $q.all(promises).then(function (s) {
                                angular.forEach(s, function (v) {
                                    stateHtmlMap[v.stateid] = v.html;
                                });
                                var loaders = [];
                                $.each(data.nodes, function (i, v) {
                                    //loaders.push(bmsRenderingService.loadHtml(v, stateHtmlMap[v.data.id]));
                                    loaders.push(bmsRenderingService.loadImage(v, stateHtmlMap[v.data.id]));
                                });
                                $q.all(loaders).then(function () {
                                    defer.resolve(data);
                                });
                            });

                        });

                        return defer.promise;

                    };

                    $scope.loadData = function (data) {
                        if (data) {
                            if (!$scope.cy) {
                                bmsDiagramTraceGraph.build($element, data).then(function (result) {
                                    $scope.cy = result.cy;
                                    $scope.navigator = result.navigator;
                                });
                            } else {
                                $scope.cy.load(data);
                                $scope.refreshNavigator();
                            }
                        }
                    };

                    $scope.refreshDiagram = function () {
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
                    });

                }
            }

        }]);

});
