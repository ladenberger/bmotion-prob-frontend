/**
 * BMotion Studio for ProB module
 *
 */
define(['module', 'prob-func', 'angularAMD', 'bmotion-config', 'bmotion-ui', 'jquery', 'jquery.cookie', 'jquery-ui', 'xeditable', 'cytoscape'], function (module, probFunctions, angularAMD, config) {

        var bmotion = window.bmotion || (window.bmotion = {});

        var probModule = angular.module('probModule', ['bmsModule', 'xeditable'])
            .config(['$controllerProvider', function ($controllerProvider) {
                probModule.registerCtrl = $controllerProvider.register;
            }])
            .run(["$rootScope", 'editableOptions', function ($rootScope, editableOptions) {
                $rootScope.observers = module.config().observers;
                $rootScope.formulaElements = [];
                $rootScope.loadElements = function () {
                    $rootScope.formulaElements = [];
                    $('[data-hasobserver]').each(function (i, v) {
                        var el = $(v);
                        var observer = el.data("observer")["AnimationChanged"];
                        if (observer["formula"]) {
                            if (el.parents('svg').length) {
                                var id = $(v).attr("id");
                                if (id !== undefined) {
                                    $rootScope.formulaElements.push({
                                        value: $rootScope.formulaElements.length + 1,
                                        text: '#' + id
                                    })
                                }
                            }
                        }
                    });
                };
                $rootScope.getFormulaElements = function () {
                    return $rootScope.formulaElements;
                };
                editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
            }])
            .factory('initProB', ['$q', 'ws', 'initSession', function ($q, ws, initSession) {
                var defer = $q.defer();
                initSession.then(function (standalone) {
                    ws.emit('initProB', "", function (data) {
                        data.standalone = standalone;
                        defer.resolve(data);
                    });
                });
                return defer.promise;
            }])
            .directive('bmsApp', ['$compile', 'initProB', function ($compile, initProB) {
                return {
                    priority: 2,
                    link: function ($scope, element) {
                        initProB.then(function (data) {
                            if (data.standalone) {
                                $scope.standalone = data.standalone;
                                $scope.port = data.port;
                                $scope.traceId = data.traceId;
                                var bmsNavigation = angular.element('<prob-navigation></prob-navigation>');
                                element.find("body").append($compile(bmsNavigation)($scope));
                                var probViews = angular.element('<div>' +
                                '<div bms-dialog type="CurrentTrace"><div prob-view></div></div>' +
                                '<div bms-dialog type="Events"><div prob-view></div></div>' +
                                '<div bms-dialog type="StateInspector"><div prob-view></div></div>' +
                                '<div bms-dialog type="CurrentAnimations"><div prob-view></div></div>' +
                                '<div bms-dialog type="GroovyConsoleSession"><div prob-view></div></div>' +
                                '<div bms-dialog type="ModelCheckingUI"><div prob-view></div></div>' +
                                '<div bms-dialog type="ElementProjection"><div ng-controller="bmsDiagramCtrl" bms-diagram-element-projection-view style="width:100%;height:100%;"></div></div>' +
                                '<div bms-dialog type="TraceDiagram"><div ng-controller="bmsDiagramCtrl" bms-diagram-trace-view data-bms-svg="svg" style="width:100%;height:100%;"></div></div></div>' +
                                '</div>');
                                element.find("body").append($compile(probViews)($scope))
                            }
                        })
                    }
                }
            }])
            .directive('probNavigation', ['ws', function (ws) {
                return {
                    restrict: 'E',
                    replace: true,
                    template: '<nav class="navbar navbar-default navbar-fixed-bottom" role="navigation">'
                    + '<div class="container-fluid">'
                    + '<div class="navbar-header">'
                    + '<a class="navbar-brand" href="#">BMotion Studio for ProB</a>'
                    + '</div>'
                    + '<div class="collapse navbar-collapse">'
                    + '<ul class="nav navbar-nav navbar-right" id="bmotion-navigation">'
                    + '<li class="dropdown">'
                    + '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Model <span class="caret"></span></a>'
                    + '<ul class="dropdown-menu" role="menu">'
                    + '<li><a href="#" ng-click="reloadModel()"><i class="glyphicon glyphicon-refresh"></i> Reload</a>'
                    + '</li>'
                    + '</ul>'
                    + '</li>'
                    + '<li class="dropdown">'
                    + '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Open View <span class="caret"></span></a>'
                    + '<ul class="dropdown-menu" role="menu">'
                    + '<li><a href="#" ng-click="openView(\'CurrentTrace\')"><i class="glyphicon glyphicon-indent-left"></i> History</a></li>'
                    + '<li><a href="#" ng-click="openView(\'Events\')"><i class="glyphicon glyphicon-align-left"></i> Events</a></li>'
                    + '<li><a href="#" ng-click="openView(\'StateInspector\')"><i class="glyphicon glyphicon-list-alt"></i> State</a></li>'
                    + '<li id="bt_CurrentAnimations"><a href="#" ng-click="openView(\'CurrentAnimations\')"><i class="glyphicon glyphicon-th-list"></i> Animations</a></li>'
                    + '<li id="bt_GroovyConsoleSession"><a href="#" ng-click="openView(\'GroovyConsoleSession\')"><i class="glyphicon glyphicon-phone"></i> Console</a></li>'
                    + '<li id="bt_ModelCheckingUI"><a href="#" ng-click="openView(\'ModelCheckingUI\')"><i class="glyphicon glyphicon-ok"></i> Model Checking</a></li>'
                    + '</ul>'
                    + '</li>'
                    + '<li class="dropdown">'
                    + '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Open Diagram <span class="caret"></span></a>'
                    + '<ul class="dropdown-menu" role="menu">'
                    + '<li><a href="#" ng-click="openView(\'ElementProjection\')"><i class="glyphicon glyphicon-random"></i> Element Projection</a></li>'
                    + '<li><a href="#" ng-click="openView(\'TraceDiagram\')"><i class="glyphicon glyphicon glyphicon-road"></i> Trace Diagram</a></li>'
                    + '</ul>'
                    + '</li>'
                    + '</ul>'
                    + '</div>'
                    + '</div>'
                    + '</nav>',
                    controller: ['$scope', function ($scope) {
                        $scope.openView = function (type) {
                            $scope.$broadcast('open' + type);
                        };
                        $scope.reloadModel = function () {
                            $scope.modal.setLabel("Reloading model ...");
                            $scope.modal.show();
                            ws.emit('reloadModel', "", function () {
                                $scope.modal.hide()
                            });
                        };
                    }],
                    link: function ($scope, element) {
                        if (config.socket.host !== 'localhost') {
                            $(element).find('#bt_GroovyConsoleSession').css("display", "none");
                            $(element).find('#bt_ModelCheckingUI').css("display", "none");
                            $(element).find('#bt_CurrentAnimations').css("display", "none");
                        }
                    }
                }
            }])
            .service('bmsObserverService', function () {
                var observers = {};
                return {
                    addObservers: function (name, obs) {
                        observers[name] = obs
                    },
                    getObservers: function (name) {
                        return observers[name];
                    }
                }
            })
            .factory('bmsDialogService', [function () {
                return {
                    isOpen: function (type) {
                        return $.cookie("open_" + type) === undefined ? false : $.cookie("open_" + type);
                    },
                    open: function (element, type) {
                        $.cookie("open_" + type, true);
                        var toppos = $.cookie("position_top_" + type);
                        var leftpos = $.cookie("position_left_" + type);
                        var width = $.cookie("width_" + type);
                        var height = $.cookie("height_" + type);
                        if (toppos !== undefined && leftpos !== undefined) {
                            element.parent().css("top", toppos + "px").css("left", leftpos + "px")
                        }
                        if (width !== undefined && height !== undefined) {
                            element.parent().css("width", width + "px").css("height", height + "px")
                        }
                    },
                    close: function (type) {
                        $.removeCookie("open_" + type);
                        $.removeCookie("position_top" + type);
                        $.removeCookie("position_left_" + type);
                        $.removeCookie("width_" + type);
                        $.removeCookie("height_" + type);
                    },
                    dragStop: function (ui, type) {
                        $.cookie("position_top_" + type, ui.position.top);
                        $.cookie("position_left_" + type, ui.position.left)
                    },
                    resizeStop: function (ui, type) {
                        $.cookie("width_" + type, ui.size.width);
                        $.cookie("height_" + type, ui.size.height);
                    },
                    fixSize: function (dialog, ox, oy) {
                        var newwidth = dialog.parent().width() - ox;
                        var newheight = dialog.parent().height() - oy;
                        dialog.first().css("width", (newwidth) + "px").css("height", (newheight - 38) + "px");
                    }
                }
            }])
            .factory('bmsRenderingService', function () {

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
                            cropHeight = cropBottom - cropTop;

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
                    }

                };

                return renderingService;

            })
            .directive('probView', function () {
                return {
                    replace: true,
                    scope: true,
                    template: '<div style="width:100%;height:100%"><iframe src="" frameBorder="0" style="width:100%;height:100%"></iframe></div>',
                    link: function ($scope, element, attrs) {
                        var iframe = $(element).find("iframe");
                        $scope.$on('dragStart', function () {
                            iframe.hide();
                        });
                        $scope.$on('dragStop', function () {
                            iframe.show();
                        });
                        $scope.$on('resize', function () {
                            iframe.hide();
                        });
                        $scope.$on('resizeStart', function () {
                            iframe.hide();
                        });
                        $scope.$on('resizeStop', function () {
                            iframe.show();
                        });
                        $scope.$on('open', function () {
                            iframe.attr("src", document.location.protocol + '//' + document.location.hostname + ":" + $scope.port +
                            "/sessions/" + $scope.type + "/" + $scope.traceId);
                        });
                    }
                }
            })
            .directive('bmsDialog', ['bmsDialogService', function (bmsDialogService) {
                return {
                    scope: true,
                    controller: ['$scope', function ($scope) {
                        $scope.isOpen = false;
                    }],
                    link: function ($scope, element, attrs) {

                        $scope.type = attrs.type;
                        $scope.isOpen = bmsDialogService.isOpen($scope.type);
                        $scope.$on('open' + $scope.type, function () {
                            $(element).dialog("open");
                        });

                        $(element).first().css("overflow", "hidden");
                        $(element).dialog({

                            dragStart: function () {
                                $scope.$broadcast('dragStart');
                            },
                            dragStop: function (event, ui) {
                                bmsDialogService.dragStop(ui, $scope.type);
                                $scope.$broadcast('dragStop');
                            },
                            resize: function () {
                                $scope.$broadcast('resize');
                            },
                            resizeStart: function () {
                                $scope.$broadcast('resizeStart');
                            },
                            resizeStop: function (event, ui) {
                                bmsDialogService.resizeStop(ui, $scope.type);
                                bmsDialogService.fixSize($(element), 0, 0);
                                $scope.$broadcast('resizeStop');
                            },
                            open: function () {
                                bmsDialogService.open(element, $scope.type);
                                bmsDialogService.fixSize($(element), 0, 0);
                                $scope.isOpen = true;
                                $scope.$broadcast('open');
                            },
                            close: function () {
                                bmsDialogService.close($scope.type);
                                $scope.isOpen = false;
                                $scope.$broadcast('close');
                            },
                            autoOpen: $scope.isOpen,
                            width: 350,
                            height: 400,
                            title: $scope.type

                        });

                    }
                }
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
            .directive('bmsDiagramElementProjectionView', ['bmsDiagramElementProjectionGraph', 'ws', function (bmsDiagramElementProjectionGraph, ws) {
                return {
                    replace: false,
                    scope: true,
                    template: '<div style="width:100%;height:100%;">'
                    + '<div>'
                    + '<a href="#" editable-select="elements.selected" onshow="loadElements()" e-multiple e-ng-options="s.value as s.text for s in getFormulaElements()">'
                    + '{{ showStatus() }}'
                    + '</a>'
                    + '</div>'
                    + '<div class="projection-diagram-graph" style="height:100%;width:100%;"></div>'
                        //+ '<div class="projection-diagramnavigator"
                        // style="height:100%;width:20%;position:absolute;bottom:0;right:0;"></div>'
                    + '</div>',
                    link: function ($scope, $element) {

                        $scope.elements = {
                            selected: []
                        };

                        $scope.showStatus = function () {
                            var selected = [];
                            angular.forEach($scope.getFormulaElements(), function (s) {
                                if ($scope.elements.selected.indexOf(s.value) >= 0) {
                                    selected.push(s.text);
                                }
                            });
                            return selected.length ? selected.join(', ') : 'Not set';
                        };

                        $scope.init = function () {
                            var elements = [];
                            angular.forEach($scope.getFormulaElements(), function (s) {
                                if ($scope.elements.selected.indexOf(s.value) >= 0) {
                                    elements.push(s.text);
                                }
                            });
                            bmsDiagramElementProjectionGraph.getCurrentData(elements).then(function (data) {
                                bmsDiagramElementProjectionGraph.build($element, data).then(function (cy) {
                                    $scope.cy = cy;
                                });
                            });
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

                var cache = {};

                var _loadImage2 = function (v, html, width, height) {

                    var deferred = $.Deferred();

                    var image = new Image(),
                        canvas = document.createElement('canvas'),
                        context;

                    image.crossOrigin = "anonymous";
                    canvas.width = width;
                    canvas.height = height;
                    context = canvas.getContext("2d");

                    image.onload = function () {
                        if (context) {
                            context.drawImage(this, 0, 0, this.width, this.height);
                            var croppedCanvas = bmsRenderingService.removeBlanks(context, canvas, this.width, this.height);
                            var uri = croppedCanvas.toDataURL('image/png');
                            v.data['svg'] = uri;
                            v.data['width'] = croppedCanvas.width + 30;
                            v.data['height'] = croppedCanvas.height;
                            cache[v.data['id']] = {
                                svg: uri,
                                width: croppedCanvas.width + 30,
                                height: croppedCanvas.height
                            };
                            deferred.resolve();
                        } else {
                            // TODO: Report error if browser is to old!
                        }
                    };
                    image.src = 'data:image/svg+xml;base64,' + window.btoa(html);

                    return deferred.promise();

                };

                var _loadImage = function (v, element, width, height) {

                    var deferred = $.Deferred();

                    if (v.data.id !== 'root' && v.data.id !== '0') {
                        probFunctions.checkObserver({
                            parent: element,
                            stateId: v.data.id
                        }).done(function () {
                            _loadImage2(v, element.html(), width, height).done(function () {
                                deferred.resolve();
                            });
                        });
                    } else {
                        var clonedElement = element.clone();
                        clonedElement.find('svg').attr("width", "50").attr("height", "50");
                        clonedElement.find('svg').empty();
                        _loadImage2(v, clonedElement.html(), 50, 50).done(function () {
                            deferred.resolve();
                        });
                    }

                    return deferred.promise();

                };

                return {
                    getCurrentData: function (element) {
                        var deferred = $q.defer();
                        // TODO: Replace with new websocket
                        // Gets the current trace ...
                        ws.emit('createTraceDiagram', {}, function (data) {
                            bmsRenderingService.getStyles().done(function (css) {
                                var svgElement = $(element).clone(true);
                                svgElement.prepend($(css));
                                var loaders = [];
                                var wrapper = $('<div>').append(svgElement);
                                $.each(data.nodes, function (i, v) {
                                    var d = cache[v.data['id']];
                                    if (d === undefined) {
                                        loaders.push(_loadImage(v, wrapper, svgElement.attr("width"), svgElement.attr("height")));
                                    } else {
                                        v.data['svg'] = d.svg;
                                        v.data['width'] = d.width;
                                        v.data['height'] = d.height;
                                    }
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
            .directive('bmsDiagramTraceView', ['bmsDiagramTraceGraph', 'ws', function (bmsDiagramTraceGraph, ws) {
                return {
                    replace: false,
                    scope: true,
                    template: '<div style="height:100%;width:100%;">'
                    + '<div class="trace-diagram-graph" style="height:100%;width:100%;"></div>'
                        //+ '<div class="trace-diagram-navigator"
                        // style="height:100%;width:20%;position:absolute;bottom:0;right:0;"></div>'
                    + '</div>',
                    link: function ($scope, $element, attrs) {
                        var svgElement = attrs["bmsSvg"];
                        // TODO: Replace with new websocket
                        // Listens on a trace change ...
                        ws.on('checkObserver', function (trigger) {
                            if (trigger === 'AnimationChanged') {
                                bmsDiagramTraceGraph.getCurrentData(svgElement).then(function (data) {
                                    $scope.load(data);
                                });
                            }
                        });
                        $scope.init = function () {
                            bmsDiagramTraceGraph.getCurrentData(svgElement).then(function (data) {
                                bmsDiagramTraceGraph.build($element, data).then(function (cy) {
                                    $scope.cy = cy;
                                });
                            });
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
            .directive('bmsVisualisationViewCompiled', ['bmsObserverService', function (bmsObserverService) {
                return {
                    replace: false,
                    scope: true,
                    link: function ($scope, $element, attrs) {

                        // Rename id attribute to data-bms-id attribute in order to avoid duplicated id's
                        var idElements = $($element).find('[id]');
                        idElements.each(function (i, v) {
                            var ele = $(v);
                            ele.attr("data-bms-id", ele.attr("id"));
                            ele.removeAttr("id");
                        });

                        var observerFuncName = attrs["bmsObservers"];
                        var observers = bmsObserverService.getObservers(observerFuncName);
                        $.each(observers, function (i, v) {
                            var selector = v.selector.indexOf("#") === 0 ? "[data-bms-id=" + v.selector.substr(1, v.selector.length - 1) + "]" : v.selector;
                            var element = $($element).find(selector);
                            if (v.type === 'executeEvent') {
                                element.executeEvent(v.data);
                            } else {
                                element.observe(v.type, v.data);
                            }
                            bmotion.checkObserver()
                        });

                    }
                }
            }])
            .directive('bmsVisualisationView', ['$compile', function ($compile) {
                return {
                    replace: false,
                    controller: ['$scope', function ($scope) {
                    }],
                    link: function ($scope, $element, attrs) {
                        var observerFuncName = attrs["bmsObservers"];
                        var style = attrs["bmsStyleFile"];
                        var templateName = attrs["bmsTemplate"];
                        $.getScript(observerFuncName + ".js")
                            .done(function () {
                                $element.replaceWith($compile('<div bms-visualisation-view-compiled data-bms-observers="' + observerFuncName + '" ng-controller="liftObservers" ng-include="getContentUrl()"></div>')($scope));
                            })
                            .fail(function () {
                            });
                        $scope.getContentUrl = function () {
                            return templateName;
                        };
                        $scope.getObserverFuncName = function () {
                            return observerFuncName;
                        };
                        if (style) {
                            // In case of SVG we could also inline the styles ...
                            $("head").append($("<link rel='stylesheet' type='text/css' href='" + style + "' data-bms-style>"));
                        }
                        //var content = $element.children();
                        /*var observerData = observerDataList[observerFuncName];
                         if (observerData) {
                         $.each(observerData, function (i, o) {
                         console.log(o.type);
                         if (o.type === 'executeEvent') {
                         console.log(o)
                         }
                         });
                         }
                         if (style) {
                         $("head").append($("<link rel='stylesheet' type='text/css' href='" + style + "' data-bms-style>"));
                         }*/
                    }
                    //template: '<div ng-include="getContentUrl()"></div>'
                }
            }]);

        //var ngProB = angularAMD.bootstrap(probModule);
        probFunctions.init = function () {
            angularAMD.bootstrap(probModule);
        };

        probFunctions.registerObservers = function (name, obs) {
            probModule.registerCtrl(name, ['$scope', 'bmsObserverService', function ($scope, bmsObserverService) {
                bmsObserverService.addObservers(name, obs);
            }]);
        };

        probFunctions.init();
        return $.extend(bmotion, {config: config}, probFunctions, {module: probModule});

    }
)
;
