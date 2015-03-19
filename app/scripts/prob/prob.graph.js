/**
 * BMotion Studio for ProB Graph Module
 *
 */
define(['prob.api', 'angular', 'jquery', 'xeditable', 'cytoscape'], function (prob) {

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
                        cropWidth = cropRight - cropLeft,
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
                                deferred.resolve();
                            } else {
                                // TODO: Report error if browser is to old!
                            }
                        };
                        image.src = 'data:image/svg+xml;base64,' + window.btoa(html);
                    } else {
                        node.data['svg'] = 'data:image/svg+xml;base64,';
                        node.data['width'] = 50;
                        node.data['height'] = 50;
                        deferred.resolve();
                    }

                    return deferred.promise;

                }

            };

            return renderingService;

        }])
        .factory('bmsDiagramElementProjectionGraph', ['$q', 'ws', 'bmsRenderingService', function ($q, ws, bmsRenderingService) {

            var _loadImage2 = function (property, felements, mcanvas, mcontext, v, styleTag) {

                var deferred = $.Deferred();

                // Prepare data
                var ele = felements[property].clone;
                var type = felements[property].type;
                var ffval = [];

                $.each(felements[property].count, function (i2, v2) {
                    var trans = v.data.translated;
                    var res = v.data.results;
                    var fres = felements[property].translate ? trans[v2] : res[v2];
                    if (fres !== undefined) {
                        ffval.push(fres);
                    }
                });

                var image = new Image(),
                    canvas = document.createElement('canvas'),
                    context;
                image.crossOrigin = "anonymous";

                // Build image
                // TODO: Get correct initial width and height
                canvas.width = 1000;
                canvas.height = 1000;
                context = canvas.getContext("2d");

                image.onload = function () {
                    if (context) {
                        context.drawImage(this, 0, 0, this.width, this.height);
                        var croppedCanvas = bmsRenderingService.removeBlanks(context, canvas, this.width, this.height);
                        v.data["canvas"].push(croppedCanvas);
                        deferred.resolve();
                    } else {
                        // alert('Get a real browser!');
                    }
                };

                if (ffval.length > 0) {

                    // Trigger trigger function that modifies element according to the attached observer
                    var formulaObservers = ele.data("observer")["AnimationChanged"];
                    $.each(formulaObservers["formula"], function (i, v) {
                        v.observer.trigger.call(this, ele, ffval);
                    });
                    if (ele.prop("tagName") === 'image') {
                        image.src = ele.attr('xlink:href');
                    } else {
                        var html = $('<div>').append(ele);
                        if (type === 'svg') {
                            image.src = 'data:image/svg+xml;base64,' + window.btoa('<svg xmlns="http://www.w3.org/2000/svg" style="background-color:white" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1000">\n' + styleTag + '\n' + html.html() + '</svg>');
                        }
                    }
                } else {
                    image.src = 'data:image/svg+xml;base64,' + window.btoa('<svg xmlns="http://www.w3.org/2000/svg" style="background-color:white" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>');
                }
                return deferred.promise();

            };

            var _loadImage = function (v, felements, styleTag) {

                var deferred = $.Deferred();

                // Set default width and height of node
                v.data['width'] = 0;
                v.data['height'] = 0;

                // Create a new image for the node
                var mcanvas = document.createElement('canvas'),
                    mcontext = mcanvas.getContext("2d");

                v.data["canvas"] = [];

                var loaders = [];
                for (var property in felements) {
                    loaders.push(_loadImage2(property, felements, mcanvas, mcontext, v, styleTag));
                }

                $.when.apply(null, loaders).done(function () {

                    var fwidth = 0;
                    var fheight = 0;
                    var yoffset = 0;
                    $.each(v.data.canvas, function (i, v) {
                        fwidth = fwidth < v.width ? v.width : fwidth;
                        fheight = v.height + fheight + 15;
                    });
                    mcanvas.width = fwidth;
                    mcanvas.height = fheight;
                    $.each(v.data.canvas, function (i, v) {
                        mcontext.drawImage(v, 0, yoffset);
                        yoffset = v.height + yoffset + 15;
                    });
                    v.data['width'] = fwidth + 30;
                    v.data['height'] = yoffset + 15;
                    v.data['svg'] = mcanvas.toDataURL('image/png');
                    deferred.resolve();

                });

                return deferred.promise();

            };

            return {
                getCurrentData: function (elements) {
                    var deferred = $q.defer();
                    var felements = {};
                    var formulas = [];
                    var count = 0;
                    $.each(elements, function (i, v) {
                        var el = $(v);
                        felements[v] = {
                            count: [],
                            clone: el.data('clone'),
                            type: el.parents('svg').length ? 'svg' : 'html',
                            translate: el.data('translate')
                        };
                        $.each($(v).data("formulas"), function () {
                            felements[v]['count'].push(count);
                            count++;
                        });
                        formulas = formulas.concat($(v).data("formulas"));
                    });
                    // TODO: Replace with new websocket
                    // Gets nodes and edges according to observers ...
                    ws.emit('createCustomTransitionDiagram', {
                        data: {expressions: formulas}
                    }, function (data) {
                        bmsRenderingService.getStyles().done(function (css) {
                            var loaders = [];
                            $.each(data.nodes, function (i, v) {
                                loaders.push(_loadImage(v, felements, css));
                            });
                            $.when.apply(null, loaders).done(function () {
                                deferred.resolve(data);
                            });
                        });
                    });
                    return deferred.promise;
                },
                build: function (container, data) {
                    var deferred = $q.defer();
                    $(function () { // on dom ready
                        var graphEle = $(container).find(".projection-diagram-graph");
                        //var navigatorEle = containerEle.find(".trace-diagram-navigator");
                        graphEle.cytoscape({
                            ready: function () {
                                deferred.resolve(this);
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
                        /*.cy(function () {
                         graphEle.cyNavigator({
                         container: navigatorEle
                         });
                         });*/
                    }); // on dom ready
                    return deferred.promise;
                }
            };

        }])
        .directive('bmsDiagramElementProjectionView', ['bmsObserverService', 'bmsRenderingService', 'bmsScreenshotService', 'bmsVisualisationService', 'bmsDiagramElementProjectionGraph', 'ws', '$injector', '$http', '$q', '$templateCache', '$filter', function (bmsObserverService, bmsRenderingService, bmsScreenshotService, bmsVisualisationService, bmsDiagramElementProjectionGraph, ws, $injector, $http, $q, $templateCache, $filter) {

            var makeElementScreenshot = function (data, screenbmsid, observers, results) {

                var defer = $q.defer();

                var promises = [];

                var contents = $(data.template);

                angular.forEach(observers, function (o) {
                    var observerInstance = $injector.get(o.type, "");
                    if (observerInstance) {
                        promises.push(observerInstance.apply(o, contents, o['count'].map(function (pos) {
                            return results[pos];
                        })));
                    }
                });

                $q.all(promises).then(function (data) {

                    var fvalues = {};
                    angular.forEach(data, function (value) {
                        if (value !== undefined) {
                            $.extend(true, fvalues, value);
                        }
                    });

                    for (bmsid in fvalues) {
                        var nattrs = fvalues[bmsid];
                        for (a in nattrs) {
                            var orgElement = $(contents).find('[data-bms-id=' + bmsid + ']');
                            $(orgElement).attr(a, nattrs[a]);
                        }
                    }

                    var screenEle = contents.find('[data-bms-id=' + screenbmsid + ']');
                    var svgWrapper = $('<svg xmlns="http://www.w3.org/2000/svg" style="background-color:white" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color:white" width="1000" height="1000">').html(screenEle);

                    bmsScreenshotService.getStyle(data.style).then(function (css) {
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
                defer.resolve('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>');
                return defer.promise;
            };

            return {
                replace: false,
                scope: true,
                template: '<div style="width:100%;height:100%;">'
                + '<div>'
                + '<span>Visualisation: </span><a href="#" editable-select="visualisationSelection.selected" onshow="loadVisualisations()" e-ng-options="s.value as s.text for s in visualisationSelection.data">'
                + '{{ showVisualisationSelection() }}'
                + '</a>'
                + '</div>'
                + '<div>'
                + '<span>Element: </span><a href="#" editable-select="elementSelection.selected" onshow="loadElements()" e-ng-options="s.value as s.text for s in elementSelection.data">'
                + '{{ showElementSelection() }}'
                + '</a>'
                + '</div>'
                + '<div class="projection-diagram-graph" style="height:100%;width:100%;"></div>'
                    //+ '<div class="projection-diagramnavigator"
                    // style="height:100%;width:20%;position:absolute;bottom:0;right:0;"></div>'
                + '</div>',
                link: function ($scope, $element) {

                    $scope.visualisationName = "liftVisualisation";

                    $scope.visualisationSelection = {
                        data: [],
                        selected: undefined
                    };

                    $scope.elementSelection = {
                        observerBmsIdMap: {},
                        style: undefined,
                        template: undefined,
                        data: [],
                        selected: undefined
                    };

                    $scope.showElementSelection = function () {
                        var selected = $filter('filter')($scope.elementSelection.data, {value: $scope.elementSelection.selected});
                        return ($scope.elementSelection.selected && selected.length) ? selected[0].text : 'Not set';
                    };

                    $scope.showVisualisationSelection = function () {
                        var selected = $filter('filter')($scope.visualisationSelection.data, {value: $scope.visualisationSelection.selected});
                        return ($scope.visualisationSelection.selected && selected.length) ? selected[0].text : 'Not set';
                    };

                    $scope.loadVisualisations = function () {
                        var data = [];
                        var vis = bmsVisualisationService.getVisualisations();
                        for (p in vis) {
                            data.push({
                                value: data.length + 1,
                                text: p
                            });
                        }
                        $scope.visualisationSelection.data = data;
                    };

                    $scope.loadElements = function () {

                        var selectedVisualisation = $scope.getSelectedVisualisation();

                        if (selectedVisualisation) {

                            var data = [];
                            var observerBmsIdMap = {};

                            var vis = bmsVisualisationService.getVisualisation(selectedVisualisation.text);
                            var template = vis.template;
                            var style = vis.style;
                            var observers = bmsObserverService.getObservers(vis.observers);

                            $http.get(template, {cache: $templateCache}).success(function (tplContent) {
                                var element = $(tplContent);
                                // Give all elements an internal id
                                var count = 0;
                                element.find("*").each(function (i, v) {
                                    $(v).attr("data-bms-id", "bms" + count);
                                    count++;
                                });
                                angular.forEach(observers, function (o) {
                                    var oelement = element.find(o.data.selector);
                                    oelement.each(function (i, e) {

                                        var ele = $(e);
                                        var bmsid = ele.attr("data-bms-id");
                                        if (observerBmsIdMap[bmsid] === undefined) {
                                            observerBmsIdMap[bmsid] = [];
                                            var id = ele.attr("id");
                                            data.push({
                                                value: data.length + 1,
                                                text: id == undefined ? bmsid : id,
                                                bmsid: bmsid
                                            });
                                        }
                                        observerBmsIdMap[bmsid].push(o);

                                    });
                                });
                                $scope.elementSelection.template = $('<div>').html(element).html();
                                $scope.elementSelection.style = style;
                                $scope.elementSelection.data = data;
                                $scope.elementSelection.observerBmsIdMap = observerBmsIdMap;
                            });

                        }

                    };

                    $scope.getSelectedElement = function () {
                        var selected = $filter('filter')($scope.elementSelection.data, {value: $scope.elementSelection.selected});
                        return selected[0];
                    };

                    $scope.getSelectedVisualisation = function () {
                        var selected = $filter('filter')($scope.visualisationSelection.data, {value: $scope.visualisationSelection.selected});
                        return selected[0];
                    };

                    $scope.$watch('elementSelection.selected', function (newValue) {
                        if (newValue) {
                            $scope.init();
                        }
                    });

                    $scope.init = function () {

                        var selected = $scope.getSelectedElement();

                        if (selected) {

                            var observers = $scope.elementSelection.observerBmsIdMap[selected.bmsid];

                            // Collect observers of children
                            var jElement = $($scope.elementSelection.template).find('[data-bms-id=' + selected.bmsid + ']');
                            var jChildren = jElement.children();
                            if (jChildren.length > 0) {
                                jChildren.each(function (i, v) {
                                    var childBmsId = $(v).attr('data-bms-id');
                                    var childData = $scope.elementSelection.observerBmsIdMap[childBmsId];
                                    if (childData) {
                                        observers = observers.concat(childData);
                                    }
                                });
                            }

                            // (1) Collect formulas of observers
                            var formulas = [];
                            angular.forEach(observers, function (o) {
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

                            // (2) Send formulas to ProB and receive diagram data
                            ws.emit('createCustomTransitionDiagram', {
                                data: {expressions: formulas}
                            }, function (data) {

                                var promises = [];

                                angular.forEach(data.nodes, function (node) {
                                    var results = node.data.results;
                                    if (node.data.id !== '1' && node.data.id !== '2') {
                                        promises.push(makeElementScreenshot($scope.elementSelection, selected.bmsid, observers, results));
                                    } else {
                                        promises.push(makeEmptyScreenshot());
                                    }
                                });

                                $q.all(promises).then(function (screens) {

                                    var loaders = [];
                                    $.each(data.nodes, function (i, v) {
                                        loaders.push(bmsRenderingService.loadImage(v, screens[i]));
                                    });
                                    $q.all(loaders).then(function () {
                                        bmsDiagramElementProjectionGraph.build($element, data).then(function (cy) {
                                            $scope.cy = cy;
                                        });
                                    });

                                });

                            });

                        }

                    };
                    $scope.load = function (data) {
                        if ($scope.cy) {
                            $scope.cy.load(data);
                        }
                    };
                    $scope.refresh = function () {
                        if ($scope.cy) {
                            $scope.cy.load($scope.cy.elements().jsons())
                        }
                        /*if (graphEle) {
                         graphEle.cytoscapeNavigator('resize');
                         }*/
                    };

                    $scope.$on('initDiagram', function () {
                        $scope.init();
                    });
                    $scope.$on('refreshDiagram', function () {
                        $scope.refresh();
                    });

                }
            }

        }])
        .controller('bmsDiagramCtrl', ['$scope', function ($scope) {
            $scope.$on('open', function () {
                $scope.$broadcast('initDiagram');
            });
            $scope.$on('resizeStop', function () {
                $scope.refresh();
            });
        }])
        .factory('bmsDiagramTraceGraph', ['$q', 'ws', 'bmsRenderingService', function ($q, ws, bmsRenderingService) {

            return {

                build: function (container, data) {
                    var deferred = $q.defer();
                    $(function () { // on dom ready
                        var graphEle = $(container).find(".trace-diagram-graph");
                        //var navigatorEle = containerEle.find(".trace-diagram-navigator");
                        graphEle.cytoscape({
                            ready: function () {
                                deferred.resolve(this);
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
                        /*.cy(function () {
                         graphEle.cyNavigator({
                         container: navigatorEle
                         });
                         });*/
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
                + '<span>Visualisation: </span><a href="#" editable-select="elements.selected" onshow="loadVisElements()" e-ng-options="s.value as s.text for s in elements.data">'
                + '{{ showStatus() }}'
                + '</a>'
                + '</div>'
                + '<div class="trace-diagram-graph" style="height:100%;width:100%;"></div>'
                    //+ '<div class="trace-diagram-navigator"
                    // style="height:100%;width:20%;position:absolute;bottom:0;right:0;"></div>'
                + '</div>',
                controller: ['$scope', function ($scope) {

                    $scope.elements = {
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
                        $scope.elements.data = data;
                    };

                    $scope.showStatus = function () {
                        var selected = $filter('filter')($scope.elements.data, {value: $scope.elements.selected});
                        return ($scope.elements.selected && selected.length) ? selected[0].text : 'Not set';
                    };

                }],
                link: function ($scope, $element, attrs) {

                    $scope.init = function () {

                        if ($scope.elements.selected !== undefined) {

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
                                        loaders.push(bmsRenderingService.loadImage(v, stateHtmlMap[v.data.id]));
                                    });
                                    $q.all(loaders).then(function () {
                                        bmsDiagramTraceGraph.build($element, data).then(function (cy) {
                                            $scope.cy = cy;
                                        });
                                    });
                                });

                            });

                        }

                    };
                    $scope.load = function (data) {
                        if ($scope.cy) {
                            $scope.cy.load(data);
                        }
                    };
                    $scope.refresh = function () {
                        if ($scope.cy) {
                            $scope.cy.load($scope.cy.elements().jsons())
                        }
                    };
                    $scope.$watch('elements.selected', function () {
                        $scope.init();
                    });
                    $scope.$on('initDiagram', function () {
                        $scope.init();
                    });
                    $scope.$on('refreshDiagram', function () {
                        $scope.refresh();
                    });

                }
            }

        }]);

});
