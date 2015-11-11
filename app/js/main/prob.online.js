/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'angular', 'prob.graph', 'prob.iframe.template', 'prob.ui', 'bms.manifest', 'prob.modal', 'bms.common', 'bms.session', 'angular-route'],
    function (angularAMD, angular) {

        var module = angular.module('prob.online', ['prob.graph', 'prob.iframe.template', 'prob.ui', 'prob.modal', 'bms.manifest', 'bms.common', 'bms.session', 'ngRoute'])
            .run(['bmsMainService',
                function (bmsMainService) {
                    bmsMainService.mode = 'ModeOnline';
                }])
            .config(['$routeProvider', '$locationProvider',
                function ($routeProvider) {
                    $routeProvider
                        .when('/', {
                            template: '<div class="navbar navbar-default navbar-fixed-bottom" role="navigation">'
                            + '<div class="container-fluid">'
                            + '<div class="navbar-header">'
                            + '<a class="navbar-brand" href="">BMotion Studio for ProB</a>'
                            + '</div>'
                            + '</div>'
                            + '</div>',
                            controller: 'bmsOnlineHomeCtrl'
                        })
                        .when('/vis/:sessionId/:view/:file', {
                            template: '<div ng-controller="bmsVisualizationCtrl as vis" class="fullWidthHeight">'
                            + '<div data-bms-visualisation-session="{{vis.sessionId}}" data-bms-visualisation-view="{{vis.view}}"  data-bms-visualisation-file="{{vis.file}}" class="fullWidthHeight"></div>'
                            + '</div>'
                            + '<div ng-controller="bmsUiNavigationCtrl as nav">'
                            + '<div class="navbar navbar-default navbar-fixed-bottom" role="navigation">'
                            + '<div class="container-fluid">'
                            + '<div class="navbar-header">'
                            + '<a class="navbar-brand" href="">BMotion Studio for ProB</a>'
                            + '</div>'
                            + '<div class="collapse navbar-collapse">'
                            + '<ul class="nav navbar-nav navbar-right" id="bmotion-navigation">'
                            + '<li uib-dropdown>'
                            + '<a href="" uib-dropdown-toggle>ProB<span class="caret"></span></a>'
                            + '<ul class="uib-dropdown-menu" role="menu" aria-labelledby="single-button">'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'CurrentTrace\')">'
                            + '<i class="glyphicon glyphicon-indent-left"></i> History</a></a></li>'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'Events\')">'
                            + '<i class="glyphicon glyphicon-align-left"></i> Events</a></li>'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'StateInspector\')">'
                            + '<i class="glyphicon glyphicon-list-alt"></i> State</a></li>'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'CurrentAnimations\')">'
                            + '<i class="glyphicon glyphicon-th-list"></i> Animations</a></li>'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'ModelCheckingUI\')">'
                            + '<i class="glyphicon glyphicon-ok"></i> Model Checking</a></li>'
                            + '</ul>'
                            + '</li>'
                            + '<li uib-dropdown>'
                            + '<a href="" uib-dropdown-toggle>Diagram <span class="caret"></span></a>'
                            + '<ul class="uib-dropdown-menu" role="menu" aria-labelledby="single-button">'
                            + '<li ng-show="nav.isBAnimation()"><a href="" ng-click="nav.openElementProjectionDiagram()">'
                            + '<i class="glyphicon glyphicon-random"></i> Element Projection</a></li>'
                            + '<li role="menuitem"><a href="" ng-click="nav.openTraceDiagram()">'
                            + '<i class="glyphicon glyphicon glyphicon-road"></i> Trace Diagram</a></li>'
                            + '</ul>'
                            + '</li>'
                            + '</ul>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '<div bms-dialog type="CurrentTrace" title="History">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div bms-dialog type="Events" title="Events">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div bms-dialog type="StateInspector" title="State">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div bms-dialog type="CurrentAnimations" title="Animations">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div bms-dialog type="GroovyConsoleSession" title="Console">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div bms-dialog type="ModelCheckingUI" title="ModelChecking">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div ng-controller="bmsElementProjectionModalCtrl">'
                            + '</div>'
                            + '<div ng-controller="bmsTraceDiagramModalCtrl">'
                            + '</div>',
                            controller: 'bmsOnlineVisualizationCtrl'
                        })
                        .when('/model/:sessionId/:win/:tool', {
                            template: '<div ng-controller="bmsUiNavigationCtrl as nav">'
                            + '<div class="navbar navbar-default navbar-fixed-bottom" role="navigation">'
                            + '<div class="container-fluid">'
                            + '<div class="navbar-header">'
                            + '<a class="navbar-brand" href="">BMotion Studio for ProB</a>'
                            + '</div>'
                            + '<div class="collapse navbar-collapse">'
                            + '<ul class="nav navbar-nav navbar-right" id="bmotion-navigation">'
                            + '<li uib-dropdown>'
                            + '<a href="" uib-dropdown-toggle>ProB<span class="caret"></span></a>'
                            + '<ul class="uib-dropdown-menu" role="menu" aria-labelledby="single-button">'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'CurrentTrace\')">'
                            + '<i class="glyphicon glyphicon-indent-left"></i> History</a></a></li>'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'Events\')">'
                            + '<i class="glyphicon glyphicon-align-left"></i> Events</a></li>'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'StateInspector\')">'
                            + '<i class="glyphicon glyphicon-list-alt"></i> State</a></li>'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'CurrentAnimations\')">'
                            + '<i class="glyphicon glyphicon-th-list"></i> Animations</a></li>'
                            + '<li role="menuitem"><a href="" ng-click="nav.openDialog(\'ModelCheckingUI\')">'
                            + '<i class="glyphicon glyphicon-ok"></i> Model Checking</a></li>'
                            + '</ul>'
                            + '</li>'
                            + '</ul>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '<div bms-dialog type="CurrentTrace" title="History">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div bms-dialog type="Events" title="Events">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div bms-dialog type="StateInspector" title="State">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div bms-dialog type="CurrentAnimations" title="Animations">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div bms-dialog type="ModelCheckingUI" title="ModelChecking">'
                            + '<div prob-view></div>'
                            + '</div>'
                            + '<div ng-controller="bmsElementProjectionModalCtrl">'
                            + '</div>'
                            + '<div ng-controller="bmsTraceDiagramModalCtrl">'
                            + '</div>',
                            controller: 'bmsOnlineModelCtrl'
                        })
                        .otherwise({
                            redirectTo: '/'
                        });
                }])
            .controller('bmsOnlineHomeCtrl', ['$scope', 'initVisualizationService', '$routeParams', 'bmsModalService',
                function ($scope, initVisualizationService, $routeParams, bmsModalService) {
                    var path = $routeParams['path'];
                    if (path) {
                        initVisualizationService(path);
                    }
                    else {
                        bmsModalService.setMessage("Please provide path to bmotion.json file.<br/>Append \"\?path=[relative path to bmotion.json file]\" to URL.");
                    }
                }])
            .controller('bmsOnlineVisualizationCtrl', ['$scope',
                function ($scope) {
                }])
            .controller('bmsOnlineModelCtrl', ['$scope', '$routeParams', '$rootScope', 'loadServerData', 'bmsModalService',
                function ($scope, $routeParams, $rootScope, loadServerData, bmsModalService) {
                    var sessionId = $routeParams['sessionId'];
                    loadServerData(sessionId)
                        .then(function (serverData) {
                            $rootScope.$broadcast('closeDialog');
                            $rootScope.$broadcast('setProBViewTraceId', serverData['traceId']);
                            $rootScope.$broadcast('openDialog_CurrentTrace');
                            $rootScope.$broadcast('openDialog_Events');
                        }, function (errors) {
                            bmsModalService.openErrorDialog(errors);
                        });
                }])
            .controller('bmsVisualizationCtrl', ['$scope', '$routeParams',
                function ($scope, $routeParams) {
                    var self = this;
                    self.view = $routeParams.view;
                    self.sessionId = $routeParams.sessionId;
                    self.file = $routeParams.file;
                }])
            .directive('bmsVisualization', ['initVisualizationService', '$routeParams', 'bmsModalService',
                function (initVisualizationService, $routeParams, bmsModalService) {
                    return {
                        replace: true,
                        scope: {},
                        controller: ['$scope', function ($scope) {
                        }],
                        link: function ($scope, element, attrs) {
                            element.attr('class', 'fullWidthHeight');
                            var view = $routeParams.view;
                            var sessionId = $routeParams.sessionId;
                            if (!sessionId && !view) {
                                var path = attrs['bmsVisualization'];
                                if (path) {
                                    initVisualizationService(path);
                                } else {
                                    bmsModalService.setMessage("Please provide path to BMotion Studio manifest file.");
                                }
                            }
                        }
                    }
                }])
            .directive('bmsModel', ['initModelService', '$routeParams', 'bmsModalService',
                function (initModelService, $routeParams, bmsModalService) {
                    return {
                        replace: true,
                        scope: {},
                        controller: ['$scope', function ($scope) {
                        }],
                        link: function ($scope, element, attrs) {
                            var sessionId = $routeParams.sessionId;
                            if (!sessionId) {
                                var path = attrs['bmsModel'];
                                if (path) {
                                    initModelService(path);
                                } else {
                                    bmsModalService.setMessage("Please provide path to model file.");
                                }
                            }
                        }
                    }
                }])
            .factory('initVisualizationService', ['$location', 'bmsSessionService', 'bmsManifestService', 'bmsMainService', 'bmsModalService',
                function ($location, bmsSessionService, bmsManifestService, bmsMainService, bmsModalService) {

                    return function (manifestFilePath) {

                        bmsModalService.loading("Initialising visualisation ...");

                        bmsManifestService.validate(manifestFilePath)
                            .then(function (manifestData) {
                                return bmsManifestService.normalize(manifestData);
                            }, function (errors) {
                                bmsModalService.openErrorDialog(errors);
                            })
                            .then(function (normalizedManifestData) {

                                bmsSessionService.InitVisualizationSession(normalizedManifestData['model'], normalizedManifestData['tool'], normalizedManifestData['prob'], manifestFilePath)
                                    .then(function (sessionId) {
                                        // TODO: Handle multiple views in online mode!
                                        var views = normalizedManifestData['views'];
                                        var view = views[0];
                                        var filename = manifestFilePath.replace(/^.*[\\\/]/, '');
                                        $location.path('/vis/' + sessionId + '/' + view.id + '/' + filename);
                                        bmsModalService.endLoading();
                                    }, function (errors) {
                                        bmsModalService.openErrorDialog(errors);
                                    });
                            });

                    }

                }])
            .factory('initModelService', ['$rootScope', '$location', 'bmsSessionService', 'bmsManifestService', 'bmsMainService', 'bmsModalService', 'loadServerData',
                function ($rootScope, $location, bmsSessionService, bmsManifestService, bmsMainService, bmsModalService, loadServerData) {

                    return function (modelPath) {

                        bmsModalService.loading("Initialising Formal Model ...");

                        var filename = modelPath.replace(/^.*[\\\/]/, '');
                        var fileExtension = filename.split('.').pop();
                        var tool = fileExtension === 'csp' ? 'CSPAnimation' : 'BAnimation';

                        bmsSessionService.initFormalModelOnlySession(modelPath, tool, {preferences: {}})
                            .then(function (sessionId) {
                                $location.path('/model/' + sessionId + '/1/' + tool);
                                bmsModalService.endLoading();
                            });

                    }

                }
            ]);
        return angularAMD.bootstrap(module);

    })
;