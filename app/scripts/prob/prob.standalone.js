/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['prob.main', 'angularAMD', 'bmotion.config', 'prob.graph', 'bootstrap', 'jquery.cookie', 'jquery-ui'], function (prob, angularAMD, config) {

    var module = angular.module('prob.standalone', ['prob.main', 'prob.graph'])
        .directive('bmsApp', ['$compile', 'initProB', function ($compile, initProB) {
            return {
                controller: ['$scope', function ($scope) {
                    $scope.modal = {
                        state: 'hide',
                        label: 'Loading visualisation ...',
                        setLabel: function (label) {
                            $scope.modal.label = label
                        },
                        show: function () {
                            $scope.modal.state = 'show'
                        },
                        hide: function () {
                            $scope.modal.state = 'hide'
                        }
                    }
                }],
                link: function ($scope, element) {

                    var loadingModal1 = angular.element('<bms-loading-modal></bms-loading-modal>');
                    element.find("body").append($compile(loadingModal1)($scope));

                    $scope.modal.show();
                    $scope.modal.setLabel("Loading visualisation ...");

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
                            '<div bms-dialog type="TraceDiagram"><div ng-controller="bmsDiagramCtrl" bms-diagram-trace-view style="width:100%;height:100%;"></div></div></div>' +
                            '</div>');
                            element.find("body").append($compile(probViews)($scope))
                        }
                        $scope.modal.hide()
                    })

                }
            }
        }])
        .directive('bmsLoadingModal', function () {
            return {
                restrict: 'E',
                replace: true,
                template: '<div class="modal" id="loadingModal" tabindex="-1" role="dialog" aria-labelledby="loadingModalLabel" aria-hidden="true">'
                + '<div class="modal-dialog modal-vertical-centered">'
                + '<div class="modal-content">'
                + '<div class="modal-header">'
                + '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
                + '<h4 class="modal-title" id="loadingModalText">{{modal.label}}</h4></div>'
                + '<div class="modal-body">'
                + '<p class="bmotion-img-logo"></p>'
                + '<p class="bmotion-img-loader"></p>'
                + '</div></div></div></div>',
                link: function ($scope, element) {
                    $scope.$watch('modal.state', function (nv) {
                        $(element).modal(nv)
                    })
                }
            }
        })
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
        }]);

    return angularAMD.bootstrap(module);

});